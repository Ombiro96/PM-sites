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

/** The setup steps, in order. Stored with the choices so a later visit can resume. */
export const SETUP_STEPS = [
  "look",
  "colour",
  "details",
  "about",
  "review",
] as const;

export type SetupStep = (typeof SETUP_STEPS)[number];

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

export type StoredSetup = { website: Website; step: SetupStep };

function stepOf(stored: string): SetupStep {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed === "object" && parsed !== null && "step" in parsed) {
      const step = parsed.step;
      if (
        typeof step === "string" &&
        (SETUP_STEPS as readonly string[]).includes(step)
      )
        return step as SetupStep;
    }
  } catch {
    // No readable step: resume at the theme. The choices fall back on their own.
  }
  return "look";
}

/** Null when nothing is stored. A record counts as started, even with a missing step. */
export function parseSetup(stored: string | null): StoredSetup | null {
  if (stored === null) return null;
  return { website: parseWebsite(stored), step: stepOf(stored) };
}

export function readSetup(username: string): StoredSetup | null {
  try {
    return parseSetup(window.localStorage.getItem(key(username)));
  } catch {
    return null;
  }
}

export async function readWebsite(username: string): Promise<Website> {
  return readSetup(username)?.website ?? parseWebsite(readTryout());
}

/**
 * The theme, colour and company name a visitor tried on the landing page,
 * kept on this browser so setup starts from them after they sign up.
 */
const TRYOUT = "website:tryout";

export function saveTryout(tryout: {
  look: Look;
  brandColour: string;
  name: string;
}): void {
  try {
    window.localStorage.setItem(TRYOUT, JSON.stringify(tryout));
  } catch {
    // Setup starts from the defaults instead.
  }
}

function readTryout(): string | null {
  try {
    return window.localStorage.getItem(TRYOUT);
  } catch {
    return null;
  }
}

/** What was tried on the landing page, or null when nothing was. */
export function readTried(): {
  look: Look;
  brandColour: string;
  name: string;
} | null {
  const stored = readTryout();
  if (stored === null) return null;
  const { look, brandColour } = parseWebsite(stored);
  return { look, brandColour, name: tryoutName() };
}

/** The company name tried on the landing page, or "". */
export function tryoutName(): string {
  try {
    const { name } = JSON.parse(readTryout() ?? "{}") as { name?: unknown };
    return typeof name === "string" ? name.trim() : "";
  } catch {
    return "";
  }
}

/** Writes the choices and the step the manager should return to. */
export async function saveWebsite(
  username: string,
  website: Website,
  step: SetupStep,
): Promise<void> {
  window.localStorage.setItem(
    key(username),
    JSON.stringify({ ...website, step }),
  );
}

/** Marks setup as started, at the theme, from what was tried on the landing page or a new site's defaults. */
export function startSetup(username: string): void {
  window.localStorage.setItem(
    key(username),
    JSON.stringify({
      ...parseWebsite(readTryout()),
      step: "look" satisfies SetupStep,
    }),
  );
}

/** Records the step on an existing record. Does nothing before setup has been started. */
export function saveSetupStep(username: string, step: SetupStep): void {
  try {
    const stored = window.localStorage.getItem(key(username));
    if (stored === null) return;
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return;
    window.localStorage.setItem(
      key(username),
      JSON.stringify({ ...parsed, step }),
    );
  } catch {
    // The choices stay as they were.
  }
}

export function clearWebsite(username: string): void {
  try {
    window.localStorage.removeItem(key(username));
    window.localStorage.removeItem(TRYOUT);
  } catch {
    // Nothing was stored.
  }
}
