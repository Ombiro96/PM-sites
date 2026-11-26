import { setFetcher } from "@/lib/listings/api";
import { LOOKS } from "@/lib/site/data";
import type { Look, SiteData } from "@/lib/site/types";
import { mockFetcher } from "./mockListings";
import { stressSite } from "./stress";
import { sunriseCourt } from "./sunrise-court";
import { temboHart } from "./tembo-hart";

const SAMPLES: Record<string, SiteData> = {
  "tembo-hart": temboHart,
  "sunrise-court": sunriseCourt,
};

/**
 * The site the dev server draws, chosen in the address:
 *   ?sample=tembo-hart|sunrise-court   which sample (default tembo-hart)
 *   ?look=fresh|classic|bold|coast|estate|plain   draw it in another look
 *   ?colour=1d4e89                      another brand colour
 *   ?listings=sample|few|empty          made-up houses instead of a backend
 * `/__sections` always draws the stress-test site.
 */
export function devSite(): SiteData {
  const params = new URLSearchParams(window.location.search);
  const onTestPage = window.location.pathname.startsWith("/__sections");
  const base = onTestPage
    ? stressSite
    : (SAMPLES[params.get("sample") ?? ""] ?? temboHart);

  const look = params.get("look") as Look | null;
  const colour = params.get("colour");
  const listings = params.get("listings") ?? (onTestPage ? "sample" : null);
  const agency = import.meta.env.VITE_DEV_AGENCY ?? base.api.agency;
  if (listings) setFetcher(mockFetcher(listings, agency));

  return {
    ...base,
    site: {
      ...base.site,
      look: look && LOOKS.includes(look) ? look : base.site.look,
      brand_colour:
        colour && /^[0-9a-f]{6}$/i.test(colour)
          ? `#${colour}`
          : base.site.brand_colour,
    },
    api: {
      base: listings
        ? "http://mock.local/api"
        : (import.meta.env.VITE_DEV_API_BASE ?? "").replace(/\/+$/, ""),
      agency,
    },
  };
}
