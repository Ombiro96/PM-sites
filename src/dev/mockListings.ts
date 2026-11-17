import type { HouseCard, HouseDetail } from "@/lib/listings/types";
import block from "./pictures/b2.jpg";
import skyline from "./pictures/c1.jpg";
import keys from "./pictures/i4.jpg";
import office from "./pictures/k1.jpg";

/**
 * Made-up houses for the dev server (`?listings=sample`), shaped exactly like
 * the backend's answers, so pages can be drawn without a backend running.
 */

const location = (id: string, name: string) => ({
  id: `00000000-0000-4000-8000-0000000000${id}`,
  name,
  full_name: `${name}, Nairobi`,
  level: "area",
  path: `kenya/nairobi/${name.toLowerCase()}`,
});

const KILIMANI = location("a1", "Kilimani");
const KILELESHWA = location("a2", "Kileleshwa");
const ROYSAMBU = location("a3", "Roysambu");

const BUILDINGS = {
  arcade: {
    id: "00000000-0000-4000-8000-0000000000b1",
    name: "Arcade",
    short_code: "arc1",
  },
  lenana: {
    id: "00000000-0000-4000-8000-0000000000b2",
    name: "Lenana Court",
    short_code: "len1",
  },
  vision: {
    id: "00000000-0000-4000-8000-0000000000b3",
    name: "Vision Flats",
    short_code: "vis1",
  },
};

function house(
  n: number,
  category: string,
  label: string,
  bedrooms: number,
  building: keyof typeof BUILDINGS,
  area: typeof KILIMANI,
  rent: number,
  deposit: number | null,
  service: number,
  picture: string | null,
  available: { count?: number; from?: string },
): HouseCard {
  const property = BUILDINGS[building];
  return {
    id: `00000000-0000-4000-8000-00000000000${n}`,
    short_code: `h${n}x${n}`,
    title: `${label} at ${property.name}`,
    category,
    category_label: label,
    label: "",
    bedrooms,
    bathrooms: Math.max(1, bedrooms - 1),
    size_sqm: bedrooms ? `${30 + bedrooms * 28}.00` : null,
    currency: "KES",
    rent_amount: `${rent}.00`,
    deposit_amount: deposit === null ? null : `${deposit}.00`,
    service_charge: service ? `${service}.00` : null,
    move_in_total: `${rent + (deposit ?? 0) + service}.00`,
    available_count: available.count ?? 0,
    available_from: available.from ?? null,
    cover: picture ? { url: picture, small_url: picture } : null,
    location: area,
    landmark: "",
    property,
  };
}

const TEMBO: HouseCard[] = [
  house(
    1,
    "1_bedroom",
    "1 bedroom",
    1,
    "arcade",
    KILIMANI,
    45000,
    45000,
    3000,
    keys,
    { count: 2 },
  ),
  house(
    2,
    "2_bedroom",
    "2 bedroom",
    2,
    "lenana",
    KILELESHWA,
    70000,
    70000,
    5000,
    office,
    { count: 1 },
  ),
  house(
    3,
    "studio",
    "Studio",
    0,
    "arcade",
    KILIMANI,
    32000,
    32000,
    3000,
    block,
    { count: 1 },
  ),
  house(
    4,
    "bedsitter",
    "Bedsitter",
    0,
    "vision",
    ROYSAMBU,
    12000,
    null,
    0,
    null,
    { count: 3 },
  ),
  house(
    5,
    "3_bedroom",
    "3 bedroom",
    3,
    "lenana",
    KILELESHWA,
    95000,
    95000,
    6000,
    skyline,
    { from: "2027-01-05" },
  ),
  house(
    6,
    "1_bedroom",
    "1 bedroom",
    1,
    "vision",
    ROYSAMBU,
    18000,
    18000,
    0,
    keys,
    { count: 2 },
  ),
];

const SETS: Record<string, HouseCard[]> = {
  sample: TEMBO,
  few: TEMBO.slice(2, 5),
  empty: [],
};

function detail(card: HouseCard, all: HouseCard[]): HouseDetail {
  const photos = [card.cover?.url, office, block, skyline].filter(
    (url): url is string => Boolean(url),
  );
  return {
    ...card,
    description:
      "Bright rooms with fitted wardrobes and an open kitchen.\n\nWater is from a borehole and is included in the service charge.",
    amenities: [
      "Fitted wardrobes",
      "Open kitchen",
      "Balcony",
      "Fibre ready",
    ].map((name) => ({ name, slug: name.toLowerCase().replace(/ /g, "-") })),
    media: card.cover
      ? [...new Set(photos)].map((url, index) => ({
          id: String(index),
          kind: "photo" as const,
          url,
          small_url: url,
          video_url: null,
          caption: "",
        }))
      : [],
    property: {
      ...card.property,
      description: "",
      location: card.location,
      landmark: "Opposite the shopping centre",
      pin: { latitude: "-1.292100", longitude: "36.783900", exact: false },
      amenities: [
        "Lift",
        "Backup generator",
        "Borehole water",
        "Parking",
        "CCTV",
      ].map((name) => ({ name, slug: name.toLowerCase().replace(/ /g, "-") })),
      media: [],
      contact: { phone: null, whatsapp_number: null },
    },
    other_unit_types: all.filter(
      (other) => other.property.id === card.property.id && other.id !== card.id,
    ),
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function mockFetcher(set: string) {
  const houses = SETS[set] ?? TEMBO;
  return async (address: string, init?: RequestInit): Promise<Response> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const url = new URL(address, "http://mock.local");
    if (init?.method === "POST") return json({ id: "mock" }, 201);

    if (url.pathname.endsWith("/search/")) {
      const params = url.searchParams;
      let found = houses.filter(
        (item) =>
          (!params.get("category") ||
            item.category === params.get("category")) &&
          (!params.get("max_rent") ||
            Number(item.rent_amount) <= Number(params.get("max_rent"))) &&
          (!params.get("location") ||
            item.location.id === params.get("location")),
      );
      if (params.get("sort") === "rent_asc")
        found = [...found].sort(
          (a, b) => Number(a.rent_amount) - Number(b.rent_amount),
        );
      if (params.get("sort") === "rent_desc")
        found = [...found].sort(
          (a, b) => Number(b.rent_amount) - Number(a.rent_amount),
        );
      const size = Number(params.get("page_size")) || 20;
      const page = Number(params.get("page")) || 1;
      return json({
        count: found.length,
        page,
        page_size: size,
        num_pages: Math.max(1, Math.ceil(found.length / size)),
        results: found.slice((page - 1) * size, page * size),
      });
    }
    const link = /\/links\/r\/([^/]+)\/$/.exec(url.pathname);
    if (link) {
      const match = houses.find((item) => item.short_code === link[1]);
      return match
        ? json({ type: "unit_type", id: match.id })
        : json({ detail: "Not found." }, 404);
    }
    const unit = /\/unit-types\/([^/]+)\/$/.exec(url.pathname);
    if (unit) {
      const match = houses.find((item) => item.id === unit[1]);
      return match
        ? json(detail(match, houses))
        : json({ detail: "Not found." }, 404);
    }
    return json({ detail: "Not found." }, 404);
  };
}
