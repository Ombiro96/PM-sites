import { sunriseCourt } from "@/dev/sunrise-court";
import { temboHart } from "@/dev/tembo-hart";
import type { Look, SiteData, SiteDocument } from "@/lib/site/types";
import { readCompany, type Company } from "../company";
import { documentProblems } from "../draft";
import { draftSite, PREVIEW_PAGE } from "../preview";
import type { Rules } from "../rules";
import {
  PICTURE_BYTES_MAX,
  PICTURE_TYPES,
  PICTURES_MAX,
  type Deploy,
  type DeployResult,
  type LeadPage,
  type Picture,
  type PictureResult,
  type Problem,
  type Refusal,
  type Site,
  type SiteResult,
} from "../site";
import { readToken } from "../token";
import {
  ABOUT_TEXT_MIN,
  brandColourError,
  type Answers,
  type Audience,
} from "../website";
import rulesData from "./rules.json";

/**
 * Stands in for the backend's editor API until it is built (backend issue
 * #1313). Everything is kept in this browser, per signed-in user. Each
 * exported function has the name, arguments and refusals of the call that
 * replaces it, so the screens do not change when this file is dropped.
 *
 * Company details are the exception: they are read from the real backend,
 * because that call exists.
 */
type Copy = { document: SiteDocument; look: Look; brandColour: string };

type Stored = {
  id: string;
  addressName: string;
  audience: Audience;
  look: Look;
  brandColour: string;
  draft: SiteDocument;
  draftRevision: number;
  off: boolean;
  /** The live copy is last; the one before it is what an undo goes back to. */
  published: Copy[];
  publishedNumber: number;
  publishedAt: string | null;
  mayPublish: boolean;
  publishRequestedAt: string | null;
  /** The name and phone number that were confirmed as public, so changing either asks again. */
  confirmedFor: string | null;
  pictures: Picture[];
};

/** A sample made into a preview is shown from this many polls on. */
const POLLS_UNTIL_BUILT = 2;
const PREVIEW_HOURS = 24;
const PICTURE_EDGE_MAX = 1280;
/** Opening the preview page with this in its address draws the stored draft. */
export const STANDIN_PREVIEW = "standin";

const rules = rulesData as unknown as Rules;
const polls = new Map<string, number>();

function username(): string {
  try {
    const payload = (readToken() ?? "").split(".")[1] ?? "";
    const claims: unknown = JSON.parse(
      atob(payload.replaceAll("-", "+").replaceAll("_", "/")),
    );
    const name = (claims as { username?: unknown }).username;
    return typeof name === "string" ? name : "anyone";
  } catch {
    return "anyone";
  }
}

const key = () => `standin:site:${username()}`;

function read(): Stored | null {
  try {
    const stored = window.localStorage.getItem(key());
    return stored ? (JSON.parse(stored) as Stored) : null;
  } catch {
    return null;
  }
}

function refuse(code: string, message: string, problems: Problem[] = []) {
  return { ok: false, code, message, problems } satisfies Refusal;
}

const NO_SITE = refuse("no_site", "This account has no website yet.");
const STALE = refuse(
  "stale",
  "Someone else changed this website. Reload to see the latest version.",
);
const FULL = refuse(
  "unexpected",
  "This browser has no room left to keep the change.",
);

function write(stored: Stored): boolean {
  try {
    window.localStorage.setItem(key(), JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}

const same = (one: unknown, other: unknown) =>
  JSON.stringify(one) === JSON.stringify(other);

const confirmable = (company: Company | null) =>
  `${company?.displayName.trim() ?? ""}|${company?.phone.trim() ?? ""}`;

async function company(): Promise<Company | null> {
  try {
    return await readCompany();
  } catch {
    return null;
  }
}

function blockers(stored: Stored, details: Company | null): Problem[] {
  const problems: Problem[] = [];
  if (!details?.displayName.trim())
    problems.push({
      path: "facts.name",
      code: "required",
      message: "Add the company name the public will see.",
    });
  if (!details?.phone.trim())
    problems.push({
      path: "facts.phone",
      code: "required",
      message: "Add the phone number the public will see.",
    });
  if (stored.confirmedFor !== confirmable(details))
    problems.push({
      path: "facts",
      code: "not_confirmed",
      message: "Confirm that your name and phone number may be shown publicly.",
    });
  return [
    ...problems,
    ...documentProblems(stored.draft, rules).map(({ path, message }) => ({
      path,
      code: "required",
      message,
    })),
  ];
}

function asSite(stored: Stored, details: Company | null): Site {
  const live = stored.published.at(-1);
  const draft: Copy = {
    document: stored.draft,
    look: stored.look,
    brandColour: stored.brandColour,
  };
  return {
    id: stored.id,
    accountName: details?.displayName.trim() || username(),
    status: stored.off ? "OFF" : live ? "LIVE" : "DRAFT",
    addressName: stored.addressName,
    url: null,
    audience: stored.audience,
    look: stored.look,
    brandColour: stored.brandColour,
    draft: stored.draft,
    draftRevision: stored.draftRevision,
    hasUnpublishedChanges: !live || !same(live, draft),
    publishedNumber: live ? stored.publishedNumber : null,
    publishedAt: stored.publishedAt,
    canUndo: stored.published.length > 1,
    mayPublish: stored.mayPublish,
    publishRequestedAt: stored.publishRequestedAt,
    publishProblems: blockers(stored, details),
    canEditCompanyDetails: true,
  };
}

/** Runs one change on the stored site and answers as the backend would. */
async function change(
  act: (stored: Stored, details: Company | null) => Refusal | void,
  expectedRevision?: number,
): Promise<SiteResult> {
  const stored = read();
  if (!stored) return NO_SITE;
  if (
    expectedRevision !== undefined &&
    expectedRevision !== stored.draftRevision
  )
    return STALE;
  const details = await company();
  const refusal = act(stored, details);
  if (refusal) return refusal;
  if (!write(stored)) return FULL;
  return { ok: true, site: asSite(stored, details) };
}

function withIds(document: SiteDocument): SiteDocument {
  const id = (prefix: string) =>
    `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
  const given = <Holder extends { id?: string }>(
    holder: Holder,
    prefix: string,
  ) => (holder.id ? holder : { ...holder, id: id(prefix) });
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...given(page, "pg"),
      sections: page.sections.map((section) => {
        const kept = given(section, "sec");
        const items = (kept as { items?: { id?: string }[] }).items;
        return items
          ? { ...kept, items: items.map((item) => given(item, "it")) }
          : kept;
      }),
    })) as SiteDocument["pages"],
  };
}

/** The contract's sample pages under the manager's own name, with their About text when they gave one. */
function firstDraft(
  audience: Audience,
  answers: Answers,
  name: string,
): { document: SiteDocument; pictures: Picture[] } {
  const sample: SiteData = audience === "tenants" ? sunriseCourt : temboHart;
  const quoted = (value: string) => JSON.stringify(value).slice(1, -1);
  const document = JSON.parse(
    JSON.stringify(sample.document).replaceAll(
      quoted(sample.facts.name),
      quoted(name),
    ),
  ) as SiteDocument;
  const about = answers.about_text.trim();
  if (about.length >= ABOUT_TEXT_MIN)
    for (const page of document.pages)
      for (const section of page.sections)
        if (section.type === "about") section.fields.text = about;
  return {
    document,
    pictures: Object.entries(sample.pictures).map(([id, picture]) => ({
      id,
      url: picture.large,
      width: null,
      height: null,
      description: "Example picture",
    })),
  };
}

const addressFrom = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-website";

export async function readSite(): Promise<Site | null> {
  const stored = read();
  return stored ? asSite(stored, await company()) : null;
}

export async function readRules(): Promise<Rules> {
  return rules;
}

export async function createSite({
  audience,
  answers,
}: {
  audience: Audience;
  answers: Answers;
}): Promise<SiteResult> {
  if (read())
    return refuse("site_exists", "This account already has a website.");
  const details = await company();
  const name = details?.displayName.trim() || username();
  const { document, pictures } = firstDraft(audience, answers, name);
  const stored: Stored = {
    id: `standin-${username()}`,
    addressName: addressFrom(name),
    audience,
    look: "fresh",
    brandColour: "#1d4e89",
    draft: document,
    draftRevision: 1,
    off: false,
    published: [],
    publishedNumber: 0,
    publishedAt: null,
    mayPublish: false,
    publishRequestedAt: null,
    confirmedFor: null,
    pictures,
  };
  if (!write(stored)) return FULL;
  return { ok: true, site: asSite(stored, details) };
}

export function saveDraft({
  document,
  expectedRevision,
}: {
  document: SiteDocument;
  expectedRevision: number;
}): Promise<SiteResult> {
  return change((stored) => {
    stored.draft = withIds(document);
    stored.draftRevision += 1;
  }, expectedRevision);
}

export function setLook({
  expectedRevision,
  look,
  brandColour,
}: {
  expectedRevision: number;
  look: Look;
  brandColour: string;
}): Promise<SiteResult> {
  return change((stored) => {
    const problem = brandColourError(brandColour);
    if (problem) return refuse("brand_colour", problem);
    stored.look = look;
    stored.brandColour = brandColour;
    stored.draftRevision += 1;
  }, expectedRevision);
}

function refuseIfBlocked(stored: Stored, details: Company | null) {
  const problems = blockers(stored, details);
  if (problems.length > 0)
    return refuse(
      "not_ready",
      "The website is not ready to publish yet.",
      problems,
    );
}

export function publish({
  expectedRevision,
}: {
  expectedRevision: number;
}): Promise<SiteResult> {
  return change((stored, details) => {
    const blocked = refuseIfBlocked(stored, details);
    if (blocked) return blocked;
    if (!stored.mayPublish)
      return refuse(
        "not_allowed",
        "Bomahut has not switched on publishing for this website yet.",
      );
    stored.published = [
      ...stored.published.slice(-1),
      {
        document: stored.draft,
        look: stored.look,
        brandColour: stored.brandColour,
      },
    ];
    stored.publishedNumber += 1;
    stored.publishedAt = new Date().toISOString();
    stored.publishRequestedAt = null;
    stored.off = false;
  }, expectedRevision);
}

export function askToPublish({
  expectedRevision,
}: {
  expectedRevision: number;
}): Promise<SiteResult> {
  return change((stored, details) => {
    if (stored.mayPublish)
      return refuse(
        "not_needed",
        "Publishing is already switched on for this website.",
      );
    const blocked = refuseIfBlocked(stored, details);
    if (blocked) return blocked;
    if (stored.publishRequestedAt)
      return refuse("already_asked", "You have already asked.");
    stored.publishRequestedAt = new Date().toISOString();
  }, expectedRevision);
}

export function undoPublish(): Promise<SiteResult> {
  return change((stored) => {
    if (stored.published.length === 0)
      return refuse(
        "nothing_published",
        "This website has not been published.",
      );
    if (stored.published.length < 2)
      return refuse(
        "nothing_to_undo",
        "There is no earlier version to go back to.",
      );
    stored.published = stored.published.slice(0, -1);
    stored.publishedNumber -= 1;
  });
}

export function switchOff(): Promise<SiteResult> {
  return change((stored) => {
    stored.off = true;
  });
}

export function switchOn(): Promise<SiteResult> {
  return change((stored) => {
    stored.off = false;
  });
}

/** Becomes the `confirmPublic` argument of `saveAgencyProfile`, sent with the details themselves. */
export function confirmCompanyPublic(confirmed: boolean): Promise<SiteResult> {
  return change((stored, details) => {
    stored.confirmedFor = confirmed ? confirmable(details) : null;
  });
}

export async function startPreview(): Promise<DeployResult> {
  if (!read()) return NO_SITE;
  const id = `standin-${Date.now()}`;
  polls.set(id, 0);
  return {
    ok: true,
    deploy: {
      id,
      status: "BUILDING",
      message: null,
      url: null,
      expiresAt: null,
    },
  };
}

export async function readDeploy(id: string): Promise<Deploy | null> {
  const seen = polls.get(id);
  if (seen === undefined) return null;
  polls.set(id, seen + 1);
  if (seen + 1 < POLLS_UNTIL_BUILT)
    return {
      id,
      status: "BUILDING",
      message: null,
      url: null,
      expiresAt: null,
    };
  return {
    id,
    status: "LIVE",
    message: null,
    url: `${PREVIEW_PAGE}?${STANDIN_PREVIEW}=1`,
    expiresAt: new Date(Date.now() + PREVIEW_HOURS * 3600000).toISOString(),
  };
}

export async function readPictures(): Promise<Picture[]> {
  return read()?.pictures ?? [];
}

/** Made smaller before it is kept, because a browser holds only a few megabytes. */
async function shrunk(
  file: File,
): Promise<{ url: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    PICTURE_EDGE_MAX / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return {
    url: canvas.toDataURL("image/jpeg", 0.8),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function uploadPicture({
  file,
  description,
}: {
  file: File;
  description: string;
}): Promise<PictureResult> {
  const stored = read();
  if (!stored) return NO_SITE;
  if (stored.pictures.length >= PICTURES_MAX)
    return refuse(
      "too_many_pictures",
      `A website can have up to ${PICTURES_MAX} pictures.`,
    );
  if (!PICTURE_TYPES.includes(file.type) || file.size > PICTURE_BYTES_MAX)
    return refuse(
      "bad_picture",
      "Upload a JPEG, PNG or WebP picture of up to 10 MB.",
    );
  let picture: Picture;
  try {
    picture = {
      id: `as_${Math.random().toString(16).slice(2, 10)}`,
      description: description.trim(),
      ...(await shrunk(file)),
    };
  } catch {
    return refuse("bad_picture", "We could not read that picture.");
  }
  stored.pictures = [...stored.pictures, picture];
  if (!write(stored)) return FULL;
  return { ok: true, picture };
}

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();

/** Made-up enquiries, so the list has something to show. A real site starts with none. */
const SAMPLE_LEADS: LeadPage["leads"] = [
  {
    id: "lead-1",
    kind: "management_request",
    name: "Peter M.",
    phone: "0700 000 101",
    who: "owner",
    buildingLocation: "Ruaka",
    unitCount: 24,
    message: "Please call in the afternoon.",
    page: "owners",
    createdAt: daysAgo(0),
  },
  {
    id: "lead-2",
    kind: "message",
    name: "Grace A.",
    phone: "0700 000 102",
    who: "looking_for_house",
    buildingLocation: "",
    unitCount: null,
    message: "Do you have any bedsitters coming up in Kilimani?",
    page: "contact",
    createdAt: daysAgo(1),
  },
  {
    id: "lead-3",
    kind: "management_request",
    name: "Samuel K.",
    phone: "0700 000 103",
    who: "owner",
    buildingLocation: "Westlands",
    unitCount: 8,
    message: "Maisonettes, all let at the moment.",
    page: "home",
    createdAt: daysAgo(3),
  },
  {
    id: "lead-4",
    kind: "message",
    name: "Lucy N.",
    phone: "0700 000 104",
    who: "tenant",
    buildingLocation: "",
    unitCount: null,
    message: "I am at Sunrise Court and need a statement.",
    page: "contact",
    createdAt: daysAgo(6),
  },
];

export async function readLeads({
  offset,
  limit,
}: {
  offset: number;
  limit: number;
}): Promise<LeadPage> {
  const leads = read() ? SAMPLE_LEADS : [];
  return {
    totalCount: leads.length,
    leads: leads.slice(offset, offset + limit),
  };
}

/** Only Bomahut staff switch publishing on, in the admin site. This plays that while there is no backend. */
export function standinAllowPublishing(allowed: boolean): Promise<SiteResult> {
  return change((stored) => {
    stored.mayPublish = allowed;
  });
}

/** Forgets the stored website, so setup can be gone through again. */
export function standinForget(): void {
  window.localStorage.removeItem(key());
}

/** The stored draft as site data, for the preview page opened in its own tab. */
export async function standinPreviewSite(): Promise<SiteData | null> {
  const stored = read();
  if (!stored) return null;
  return draftSite({
    id: stored.id,
    addressName: stored.addressName,
    look: stored.look,
    brandColour: stored.brandColour,
    document: stored.draft,
    company: await company(),
    pictures: stored.pictures,
  });
}
