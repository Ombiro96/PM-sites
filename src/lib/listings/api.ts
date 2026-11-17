import type { SiteData } from "@/lib/site/types";
import type {
  AgencyOverview,
  HouseCard,
  HouseDetail,
  SearchFilters,
  SearchResult,
} from "./types";

type Api = SiteData["api"];

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail = "",
  ) {
    super(`Request failed (${status})`);
  }
}

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

let fetcher: Fetcher = (url, init) => fetch(url, init);

/** Replaces how requests are made. Used by the dev server's made-up listings. */
export function setFetcher(next: Fetcher): void {
  fetcher = next;
  reads.clear();
}

/**
 * How long an answer is reused. Houses are let and rents change, so a page
 * opened again after this asks afresh; the backend caches for the same time.
 */
export const FRESH_FOR_MS = 60_000;

const reads = new Map<string, { at: number; request: Promise<unknown> }>();
const idsByShortCode = new Map<string, string>();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function detailOf(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "detail" in body) {
      return typeof body.detail === "string" ? body.detail : "";
    }
  } catch {
    // An answer with no readable body still fails with its status.
  }
  return "";
}

/**
 * One GET per address while its answer is fresh, so sections drawn together
 * share it. A failed read is forgotten so the next visit tries again.
 */
function read<T>(url: string): Promise<T> {
  const known = reads.get(url);
  if (known && Date.now() - known.at < FRESH_FOR_MS)
    return known.request as Promise<T>;
  const request = fetcher(url, { credentials: "omit" })
    .then(async (response) => {
      if (!response.ok)
        throw new ApiError(response.status, await detailOf(response));
      return (await response.json()) as T;
    })
    .catch((error: unknown) => {
      reads.delete(url);
      throw error instanceof ApiError ? error : new ApiError(0);
    });
  reads.set(url, { at: Date.now(), request });
  return request;
}

function remember(cards: HouseCard[]): void {
  for (const card of cards) {
    if (card.short_code) idsByShortCode.set(card.short_code, card.id);
  }
}

export function searchUrl(api: Api, filters: SearchFilters = {}): string {
  const params = new URLSearchParams({ agency: api.agency });
  if (filters.category) params.set("category", filters.category);
  if (filters.max_rent) params.set("max_rent", filters.max_rent);
  if (filters.location) params.set("location", filters.location);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  return `${api.base}/listings/v1/search/?${params}`;
}

export async function searchHouses(
  api: Api,
  filters: SearchFilters = {},
): Promise<SearchResult> {
  if (!api.base || !api.agency) throw new ApiError(0);
  const result = await read<SearchResult>(searchUrl(api, filters));
  if (!result || !Array.isArray(result.results)) throw new ApiError(0);
  remember(result.results);
  return result;
}

/**
 * One house by the id or short code in its address. Throws `ApiError` with
 * status 404 when the house is no longer advertised.
 */
export async function getHouse(
  api: Api,
  idOrCode: string,
): Promise<HouseDetail> {
  if (!api.base) throw new ApiError(0);
  let id = idOrCode;
  if (!UUID.test(idOrCode)) {
    const known = idsByShortCode.get(idOrCode);
    if (known) {
      id = known;
    } else {
      const link = await read<{ type: string; id: string }>(
        `${api.base}/listings/v1/links/r/${encodeURIComponent(idOrCode)}/`,
      );
      id = link.id;
    }
  }
  const house = await read<HouseDetail>(
    `${api.base}/listings/v1/unit-types/${encodeURIComponent(id)}/`,
  );
  if (!house || typeof house.id !== "string") throw new ApiError(0);
  // The backend finds any company's house by id; this site shows only its own.
  if (!api.agency || house.agency?.slug !== api.agency) throw new ApiError(404);
  remember(house.other_unit_types ?? []);
  return house;
}

export function housePath(house: Pick<HouseCard, "id" | "short_code">): string {
  return `/houses/${encodeURIComponent(house.short_code || house.id)}`;
}

const NOTHING: AgencyOverview = {
  listings: { count: 0, page: 1, page_size: 0, num_pages: 1, results: [] },
  buildings: [],
  filters: {
    categories: [],
    locations: [],
    lowest_rent: null,
    highest_rent: null,
  },
};

/**
 * The company's first houses to let, every building it advertises and the
 * choices its filters offer. A company that is not advertising has nothing,
 * which is different from the backend being out of reach.
 */
export async function getAgencyOverview(
  api: Api,
  pageSize: number,
): Promise<AgencyOverview> {
  if (!api.base || !api.agency) throw new ApiError(0);
  let overview: AgencyOverview;
  try {
    overview = await read<AgencyOverview>(
      `${api.base}/listings/v1/agencies/${encodeURIComponent(api.agency)}/?page_size=${pageSize}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return NOTHING;
    throw error;
  }
  if (!overview || !Array.isArray(overview.listings?.results))
    throw new ApiError(0);
  remember(overview.listings.results);
  return {
    listings: overview.listings,
    buildings: Array.isArray(overview.buildings) ? overview.buildings : [],
    filters: { ...NOTHING.filters, ...overview.filters },
  };
}

export type PostResult = { ok: true } | { ok: false; message: string };

/** Sends a form as JSON and turns the answer into words for the visitor. */
export async function postForm(
  url: string,
  body: Record<string, unknown>,
): Promise<PostResult> {
  try {
    const response = await fetcher(url, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 201 || response.status === 200) return { ok: true };
    if (response.status === 429) {
      return { ok: false, message: "Too many messages, try again later." };
    }
    if (response.status === 400) {
      const detail = await detailOf(response);
      return {
        ok: false,
        message: detail || "Please check what you entered and try again.",
      };
    }
  } catch {
    // Falls through to the general message.
  }
  return {
    ok: false,
    message: "We could not send this just now. Please try again.",
  };
}

export function enquiryUrl(api: Api): string {
  return `${api.base}/listings/v1/enquiries/`;
}

export function leadsUrl(api: Api, siteId: string): string {
  return `${api.base}/websites/v1/public/sites/${encodeURIComponent(siteId)}/leads/`;
}

/** Tells the backend a visitor tapped WhatsApp or Call on a house. Never waits or fails. */
export function recordTap(
  api: Api,
  houseId: string,
  channel: "whatsapp_tap" | "call_tap",
): void {
  if (!api.base) return;
  fetcher(enquiryUrl(api), {
    method: "POST",
    credentials: "omit",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unit_type_id: houseId, channel }),
  }).catch(() => undefined);
}
