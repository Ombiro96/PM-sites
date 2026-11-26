import { initials, safeUrl } from "@/lib/utils";
import { brandVariables } from "./brand";
import type { SiteData } from "./types";

const escaped = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The browser tab's icon: the manager's logo, or without one the name's initials on the brand colour, as in the menu bar. */
export function faviconHref(site: SiteData): string {
  const logo = safeUrl(site.facts.logo);
  if (logo) return logo;
  const colours = brandVariables(site.site.brand_colour, site.site.look);
  const mark =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="12" fill="${colours["--brand"]}"/>` +
    `<text x="32" y="33" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="system-ui,-apple-system,Segoe UI,Arial,sans-serif" font-size="28" font-weight="700" ` +
    `fill="${colours["--on"]}">${escaped(initials(site.facts.name))}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(mark)}`;
}

export function setFavicon(site: SiteData): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }
  link.href = faviconHref(site);
}
