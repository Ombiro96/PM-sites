import type { SiteData } from "@/lib/site/types";
import type {
  Building,
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

const reads = new Map<string, Promise<unknown>>();
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

/** One GET per address; a failed read is forgotten so the next visit tries again. */
function read<T>(url: string): Promise<T> {
  const known = reads.get(url);
  if (known) return known as Promise<T>;
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
  reads.set(url, request);
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
  remember(house.other_unit_types ?? []);
  return house;
}

export function housePath(house: Pick<HouseCard, "id" | "short_code">): string {
  return `/houses/${encodeURIComponent(house.short_code || house.id)}`;
}

/** The buildings behind a set of houses, in the order they first appear. */
export function buildingsOf(houses: HouseCard[]): Building[] {
  const buildings = new Map<string, Building>();
  for (const house of houses) {
    const known = buildings.get(house.property.id);
    if (known) {
      known.houseTypes += 1;
      known.cover = known.cover ?? house.cover;
    } else {
      buildings.set(house.property.id, {
        id: house.property.id,
        name: house.property.name,
        area: house.location.full_name || house.location.name,
        cover: house.cover,
        houseTypes: 1,
      });
    }
  }
  return [...buildings.values()];
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
