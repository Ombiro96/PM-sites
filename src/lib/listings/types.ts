/**
 * What the backend's public listings endpoints return
 * (`backend/listings/utilities/public.py`). Amounts are decimal strings.
 */

export type ListingLocation = {
  id: string;
  name: string;
  full_name: string;
  level: string;
  path: string;
};

export type ListingCover = { url: string | null; small_url: string | null };

export type HouseCard = {
  id: string;
  short_code: string | null;
  title: string;
  category: string;
  category_label: string;
  label: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqm: string | null;
  currency: string;
  rent_amount: string | null;
  /** Null when the manager has not stated a deposit. */
  deposit_amount: string | null;
  service_charge: string | null;
  move_in_total: string | null;
  available_count: number | null;
  available_from: string | null;
  cover: ListingCover | null;
  location: ListingLocation;
  landmark: string;
  property: { id: string; name: string; short_code: string | null };
};

export type ListingMedia = {
  id: string;
  kind: "photo" | "video_link";
  url: string | null;
  small_url: string | null;
  video_url: string | null;
  caption: string;
};

export type Amenity = { name: string; slug: string };

export type HouseDetail = Omit<HouseCard, "property"> & {
  description: string;
  amenities: Amenity[];
  media: ListingMedia[];
  property: {
    id: string;
    short_code: string | null;
    name: string;
    description: string;
    location: ListingLocation;
    landmark: string;
    pin: { latitude: string; longitude: string; exact: boolean } | null;
    amenities: Amenity[];
    media: ListingMedia[];
    contact: { phone: string | null; whatsapp_number: string | null };
  };
  other_unit_types: HouseCard[];
};

export type SearchResult = {
  count: number;
  page: number;
  page_size: number;
  num_pages: number;
  results: HouseCard[];
};

export type SearchFilters = {
  category?: string;
  max_rent?: string;
  location?: string;
  sort?: string;
  page?: number;
  page_size?: number;
};

/** A building, as far as the listings of its house types describe it. */
export type Building = {
  id: string;
  name: string;
  area: string;
  cover: ListingCover | null;
  houseTypes: number;
};
