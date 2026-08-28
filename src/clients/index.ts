import type { Brand } from "@/lib/brand/types";
import type { ListingContent } from "@/lib/listings/content";
import { abcBrand } from "./abc/brand";
import { abcListings } from "./abc/listings";

export type Client = {
  brand: Brand;
  listings: ListingContent[];
};

/**
 * The only file that changes when a new property manager is onboarded, besides
 * their own `src/clients/<slug>/` folder.
 */
export const clients: Client[] = [
  { brand: abcBrand, listings: abcListings },
];

export const defaultClientSlug = "abc";
