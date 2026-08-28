import type { Brand } from "./types";

/**
 * Letters for the generated tab icon, home-screen icon and wordmark fallback.
 * Two letters suit most names; a brand whose mark reads better with one or
 * three sets `logos.monogram` explicitly.
 */
export function brandMonogram(brand: Brand): string {
  return (
    brand.logos.monogram ?? brand.company.shortName.slice(0, 2)
  ).toUpperCase();
}
