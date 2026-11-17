import { resolvePicture } from "./pictures";
import type { Background, Look, Section, SiteData } from "./types";

/** The small label some looks print above a section heading. */
export const EYEBROWS: Partial<Record<Section["type"], string>> = {
  houses: "To let",
  about: "About us",
  services: "What we do",
  steps: "How we work",
  figures: "In numbers",
  buildings: "Our buildings",
  team: "The team",
  testimonials: "In their words",
  areas: "Where",
  questions: "Questions",
  fees: "What it costs",
  management_request: "For owners",
  message_form: "Write to us",
  contact: "Contact",
};

/** Backgrounds each section type may take; the first is its default. */
const BACKGROUNDS: Partial<Record<Section["type"], Background[]>> = {
  houses: ["white", "tinted"],
  about: ["white", "tinted"],
  services: ["white", "tinted"],
  steps: ["tinted", "white", "brand"],
  figures: ["brand", "tinted"],
  buildings: ["white", "tinted"],
  team: ["tinted", "white"],
  testimonials: ["tinted", "white"],
  areas: ["white", "tinted"],
  questions: ["white", "tinted"],
  fees: ["white", "tinted"],
  management_request: ["tinted", "white", "brand"],
  message_form: ["tinted", "white"],
  contact: ["white", "tinted"],
};

export function backgroundOf(section: Section): Background {
  const allowed = BACKGROUNDS[section.type] ?? ["white"];
  return section.background && allowed.includes(section.background)
    ? section.background
    : allowed[0];
}

/** Looks that put a page title's picture behind the title. */
const PHOTO_TITLE_LOOKS: Look[] = ["classic", "coast", "estate"];
/** Looks whose header sits on top of a photo banner instead of above it. */
const OVERLAY_HEADER_LOOKS: Look[] = ["coast", "estate"];

/** Whether a page's opening section is drawn as a photo with text on top. */
export function opensWithPhoto(section: Section | undefined, site: SiteData): boolean {
  if (!section || section.hidden) return false;
  if (section.type === "top_banner") {
    const layout = section.layout;
    if (layout !== "photo" && layout !== "centre") return false;
    return resolvePicture(section.fields?.pictures?.[0], site.pictures) !== null;
  }
  if (section.type === "page_title") {
    return (
      PHOTO_TITLE_LOOKS.includes(site.site.look) &&
      resolvePicture(section.fields?.picture, site.pictures) !== null
    );
  }
  return false;
}

export function headerOverlays(section: Section | undefined, site: SiteData): boolean {
  return OVERLAY_HEADER_LOOKS.includes(site.site.look) && opensWithPhoto(section, site);
}
