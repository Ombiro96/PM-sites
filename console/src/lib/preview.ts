import { temboHart } from "@/dev/tembo-hart";
import { STANDARD_SERVICES } from "@/dev/wording";
import type { Look, SiteData, SiteDocument } from "@/lib/site/types";
import type { Company } from "./company";
import type { Picture } from "./site";

/** The page that draws a site inside a frame, and the two messages it trades with the console. */
export const PREVIEW_PAGE = "/preview.html";
export const PREVIEW_READY = "preview-ready";
export const PREVIEW_SITE = "preview-site";
/** Sent by the frame once the site it was given is on the screen with its fonts. */
export const PREVIEW_DRAWN = "preview-drawn";
/** Sent by the frame when a section is clicked while the console is editing. */
export const PREVIEW_PICK = "preview-pick";
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

/** The example site under a name typed on the landing page, keeping the sample's phone numbers. */
export function triedSite({
  look,
  brandColour,
  name,
}: {
  look: Look;
  brandColour: string;
  name: string;
}): SiteData {
  const drawn = exampleSite({ look, brandColour, company: null });
  const named = name.trim();
  return named ? { ...drawn, facts: { ...drawn.facts, name: named } } : drawn;
}

/**
 * The manager's own pages, as they stand in the editor. Their name, numbers
 * and pictures are real. What the backend fills in at publish (houses,
 * buildings, figures and the other company facts) is not known here, so the
 * houses are made up and the figures are examples.
 */
export function draftSite({
  id,
  addressName,
  look,
  brandColour,
  document,
  company,
  pictures,
}: {
  id: string;
  addressName: string;
  look: Look;
  brandColour: string;
  document: SiteDocument;
  company: Company | null;
  pictures: readonly Picture[];
}): SiteData {
  return {
    version: 1,
    site: {
      id,
      address: addressName,
      look,
      brand_colour: brandColour,
      show_credit: true,
      preview: true,
    },
    facts: {
      name: company?.displayName || "Your company",
      logo: "",
      phone: company?.phone ?? "",
      whatsapp: company?.whatsappNumber ?? "",
      email: "",
      office_address: "",
      opening_hours: "",
      latitude: null,
      longitude: null,
      social_links: {},
      areas_served: [],
    },
    figures: temboHart.figures,
    pictures: Object.fromEntries(
      pictures.map(({ id: asset, url }) => [asset, { small: url, large: url }]),
    ),
    wording: { services: STANDARD_SERVICES },
    document,
    api: { base: EXAMPLE_API_BASE, agency: addressName },
  };
}
