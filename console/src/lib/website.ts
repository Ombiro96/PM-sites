import { LOOKS } from "@/lib/site/data";
import type { Look } from "@/lib/site/types";

/**
 * The choices a manager makes for their website. The backend's `websites` app
 * has no calls for these yet, so they are kept in this browser; when it has,
 * `readWebsite` and `saveWebsite` are the only two functions to change.
 */
export type Audience = "tenants" | "landlords" | "both";
export type Website = { look: Look; brandColour: string; audience: Audience };

export const AUDIENCES: readonly Audience[] = ["tenants", "landlords", "both"];

/** What the backend gives a new site (`Site` in `backend/websites/models/site.py`). */
const NEW_WEBSITE: Website = {
  look: "fresh",
  brandColour: "#1d4e89",
  audience: "tenants",
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
  return {
    look: LOOKS.includes(look as Look) ? (look as Look) : NEW_WEBSITE.look,
    brandColour:
      typeof brandColour === "string" && !brandColourError(brandColour)
        ? brandColour
        : NEW_WEBSITE.brandColour,
    audience: AUDIENCES.includes(audience as Audience)
      ? (audience as Audience)
      : NEW_WEBSITE.audience,
  };
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
