import type { Look, SiteData } from "./types";

export const LOOKS: readonly Look[] = [
  "fresh",
  "classic",
  "bold",
  "coast",
  "estate",
  "plain",
  "midnight",
  "studio",
  "parchment",
  "lab",
  "moss",
  "dusk",
  "gallery",
  "catalogue",
  "neon",
  "collage",
];

const DATA_ELEMENT_ID = "site-data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function coordinate(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Checks the object the backend wrote and fills in anything optional, so the
 * rest of the app can read it without guarding every field. Returns null when
 * it is not site data this version of the app can draw.
 */
export function parseSiteData(raw: unknown): SiteData | null {
  if (!isRecord(raw) || raw.version !== 1) return null;
  const { site, facts, document, api } = raw;
  if (!isRecord(site) || !isRecord(facts) || !isRecord(document)) return null;
  if (!Array.isArray(document.pages)) return null;

  const figures = isRecord(raw.figures) ? raw.figures : {};
  const wording = isRecord(raw.wording) ? raw.wording : {};
  const header = isRecord(document.header) ? document.header : {};
  const footer = isRecord(document.footer) ? document.footer : {};
  const look = LOOKS.includes(site.look as Look)
    ? (site.look as Look)
    : "plain";
  const contactAction = text(header.contact_action);

  return {
    version: 1,
    site: {
      id: text(site.id),
      address: text(site.address),
      look,
      brand_colour: text(site.brand_colour),
      show_credit: site.show_credit !== false,
      preview: site.preview === true,
    },
    facts: {
      name: text(facts.name),
      logo: text(facts.logo),
      phone: text(facts.phone),
      whatsapp: text(facts.whatsapp),
      email: text(facts.email),
      office_address: text(facts.office_address),
      opening_hours: text(facts.opening_hours),
      latitude: coordinate(facts.latitude),
      longitude: coordinate(facts.longitude),
      social_links: isRecord(facts.social_links)
        ? (facts.social_links as SiteData["facts"]["social_links"])
        : {},
      areas_served: Array.isArray(facts.areas_served)
        ? facts.areas_served.filter((area) => typeof area === "string")
        : [],
    },
    figures: {
      buildings: count(figures.buildings),
      units: count(figures.units),
      towns: count(figures.towns),
    },
    pictures: isRecord(raw.pictures)
      ? (raw.pictures as SiteData["pictures"])
      : {},
    wording: {
      services: isRecord(wording.services)
        ? (wording.services as SiteData["wording"]["services"])
        : {},
    },
    document: {
      version: typeof document.version === "number" ? document.version : 1,
      header: {
        show_tenant_login: header.show_tenant_login === true,
        contact_action:
          contactAction === "whatsapp" || contactAction === "call"
            ? contactAction
            : "auto",
      },
      footer: { show_social: footer.show_social !== false },
      pages: (document.pages as SiteData["document"]["pages"]).filter(
        (page) => isRecord(page) && Array.isArray(page.sections),
      ),
    },
    api: {
      base: isRecord(api) ? text(api.base).replace(/\/+$/, "") : "",
      agency: isRecord(api) ? text(api.agency) : "",
    },
  };
}

/** Reads the data the backend wrote into the page. Null when there is none. */
export function readInjectedData(doc: Document = document): SiteData | null {
  const element = doc.getElementById(DATA_ELEMENT_ID);
  if (!element?.textContent) return null;
  try {
    return parseSiteData(JSON.parse(element.textContent));
  } catch {
    return null;
  }
}
