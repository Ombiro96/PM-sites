import type { Brand } from "@/lib/brand/types";
import type { ListingContent } from "@/lib/listings/content";
import { ferrumBrand } from "./ferrum/brand";
import { ferrumListings } from "./ferrum/listings";

export type Client = {
  brand: Brand;
  listings: ListingContent[];
};

/**
 * The only file that changes when a new property manager is onboarded, besides
 * their own `src/clients/<slug>/` folder.
 */
export const clients: Client[] = [
  { brand: ferrumBrand, listings: ferrumListings },
];

export const defaultClientSlug = "ferrum";
