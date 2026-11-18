import { temboHart } from "@/dev/tembo-hart";
import type { Look, SiteData } from "@/lib/site/types";
import type { Company } from "./company";

/** The page that draws a site inside a frame, and the two messages it trades with the console. */
export const PREVIEW_PAGE = "/preview.html";
export const PREVIEW_READY = "preview-ready";
export const PREVIEW_SITE = "preview-site";
/** Not a real address: the frame answers listings calls with made-up houses. */
export const EXAMPLE_API_BASE = "http://mock.local/api";

/**
 * The example site in the manager's look and colour, under their company's
 * name and numbers once they have given them. The pages are the full sample
 * from the contract, not the manager's own.
 */
export function exampleSite({
  look,
  brandColour,
  company,
}: {
  look: Look;
  brandColour: string;
  company: Company | null;
}): SiteData {
  return {
    ...temboHart,
    site: { ...temboHart.site, look, brand_colour: brandColour },
    facts: company
      ? {
          ...temboHart.facts,
          name: company.displayName,
          phone: company.phone,
          whatsapp: company.whatsappNumber,
        }
      : temboHart.facts,
    api: { ...temboHart.api, base: EXAMPLE_API_BASE },
  };
}
