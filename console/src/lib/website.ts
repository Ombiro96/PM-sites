import { LOOKS } from "@/lib/site/data";
import type { Look, StandardService } from "@/lib/site/types";

/**
 * The choices a manager makes while setting up, before their website exists.
 * They are kept in this browser between steps and sent together when the
 * first draft is written (`createSite` in `site.ts`).
 */
export type Audience = "tenants" | "landlords" | "both";

/** What the first draft is written from. The names are the backend's (`RuleDraftUtils.build`). */
export type Answers = {
  about_text: string;
  services: StandardService[];
  show_figures: boolean;
};

export type Website = {
  look: Look;
  brandColour: string;
  audience: Audience;
  answers: Answers;
};

export const ABOUT_TEXT_MIN = 40;
export const ABOUT_TEXT_MAX = 700;
/** The services offered at setup, in the order shown. */
export const SERVICE_CHOICES: readonly StandardService[] = [
  "tenant_finding",
  "rent_collection",
  "repairs",
  "owner_statements",
  "caretaker",
  "inspections",
  "lease_paperwork",
  "utilities_billing",
];

export const AUDIENCES: readonly Audience[] = ["tenants", "landlords", "both"];

/** What the backend gives a new site (`Site` in `backend/websites/models/site.py`). */
const NEW_WEBSITE: Website = {
  look: "fresh",
  brandColour: "#1d4e89",
  audience: "tenants",
  answers: { about_text: "", services: [], show_figures: false },
};

export const BRAND_COLOURS: readonly { name: string; value: string }[] = [
  { name: "Blue", value: "#1d4e89" },
  { name: "Forest", value: "#1f4d3a" },
  { name: "Teal", value: "#0f766e" },
  { name: "Burgundy", value: "#7a1f2b" },
  { name: "Terracotta", value: "#b4532a" },
  { name: "Plum", value: "#5b2a86" },
  { name: "Charcoal", value: "#2b2f36" },
  { name: "Gold", value: "#a16207" },
];

const key = (username: string) => `website:${username}`;

export function brandColourError(value: string): string | undefined {
  if (!/^#[0-9a-fA-F]{6}$/.test(value))
    return "Give the colour as # and six hex digits.";
  return undefined;
}

/** A stored value read back, with anything missing or unusable replaced by the default. */
export function parseWebsite(stored: string | null): Website {
  let found: Partial<Website> = {};
  try {
    const parsed: unknown = JSON.parse(stored ?? "{}");
    if (typeof parsed === "object" && parsed !== null) found = parsed;
  } catch {
    // Unreadable: start from the defaults.
  }
  const { look, brandColour, audience } = found;
  const answers: Partial<Answers> =
    typeof found.answers === "object" && found.answers !== null
      ? found.answers
      : {};
  return {
    look: LOOKS.includes(look as Look) ? (look as Look) : NEW_WEBSITE.look,
    brandColour:
      typeof brandColour === "string" && !brandColourError(brandColour)
        ? brandColour
        : NEW_WEBSITE.brandColour,
    audience: AUDIENCES.includes(audience as Audience)
      ? (audience as Audience)
      : NEW_WEBSITE.audience,
    answers: {
      about_text:
        typeof answers.about_text === "string" ? answers.about_text : "",
      services: Array.isArray(answers.services)
        ? SERVICE_CHOICES.filter((each) => answers.services?.includes(each))
        : [],
      show_figures: answers.show_figures === true,
    },
  };
}

export function aboutTextError(value: string): string | undefined {
  const length = value.trim().length;
  if (length > 0 && length < ABOUT_TEXT_MIN)
    return `Write at least ${ABOUT_TEXT_MIN} letters, or leave this empty.`;
  return undefined;
}

export async function readWebsite(username: string): Promise<Website> {
  try {
    return parseWebsite(window.localStorage.getItem(key(username)));
  } catch {
    return NEW_WEBSITE;
  }
}

export async function saveWebsite(
  username: string,
  website: Website,
): Promise<void> {
  window.localStorage.setItem(key(username), JSON.stringify(website));
}

export function clearWebsite(username: string): void {
  try {
    window.localStorage.removeItem(key(username));
  } catch {
    // Nothing was stored.
  }
}
