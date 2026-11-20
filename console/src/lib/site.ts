import type { Look, SiteDocument } from "@/lib/site/types";
import { graphql } from "./api";
import type { Rules } from "./rules";
import { addressError, type Answers, type Audience } from "./website";

/**
 * A manager's website as the backend's editor API gives it
 * (`backend/websites/graphql_schema`), and every call the console makes about it.
 */
export type SiteStatus = "OFF" | "DRAFT" | "LIVE";

export type Problem = {
  path: string;
  code: string;
  message: string;
  /** The length or count the problem is about, when it has one. */
  limit?: number | null;
};

export type Site = {
  id: string;
  accountName: string;
  status: SiteStatus;
  addressName: string;
  /** Null when hosting is not set up on the server. */
  url: string | null;
  audience: Audience;
  look: Look;
  brandColour: string;
  draft: SiteDocument;
  draftRevision: number;
  hasUnpublishedChanges: boolean;
  /** Whether the published version has reached visitors. `NONE` when nothing is published, or the site is off. */
  publishState: "NONE" | "PUBLISHING" | "LIVE" | "FAILED";
  publishedNumber: number | null;
  publishedAt: string | null;
  canUndo: boolean;
  mayPublish: boolean;
  publishRequestedAt: string | null;
  publishProblems: Problem[];
  canEditCompanyDetails: boolean;
};

export type Refusal = {
  ok: false;
  /** `stale`, `not_ready`, `not_allowed`, `already_asked` and the rest (`SiteUtils` in the backend). */
  code: string;
  message: string;
  problems: Problem[];
};

export type SiteResult = { ok: true; site: Site } | Refusal;

/** `leftOut` says, in sentences, what the first draft could not include and why. */
export type CreateResult =
  | { ok: true; site: Site; leftOut: string[] }
  | (Refusal & { suggestion: string | null });

export type AddressCheck = {
  available: boolean;
  problem: string | null;
  suggestion: string;
};

export type AddressVerdict =
  { ok: true } | { ok: false; problem: string; suggestion: string | null };

export type Picture = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  description: string;
  /** Only an `upload` counts towards `PICTURES_MAX`; the rest come from adverts, the logo and stock. */
  source: string;
};

export type PictureResult = { ok: true; picture: Picture } | Refusal;

export type Deploy = {
  id: string;
  status: "BUILDING" | "LIVE" | "FAILED";
  message: string | null;
  url: string | null;
  expiresAt: string | null;
};

export type DeployResult = { ok: true; deploy: Deploy } | Refusal;

export type Lead = {
  id: string;
  kind: string;
  name: string;
  phone: string;
  who: string;
  buildingLocation: string;
  unitCount: number | null;
  message: string;
  page: string;
  createdAt: string;
};

export type LeadPage = { totalCount: number; leads: Lead[] };

export const PICTURES_MAX = 50;
export const PICTURE_BYTES_MAX = 10 * 1024 * 1024;
export const PICTURE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LEADS_PER_PAGE = 50;
/** How often to ask how a preview or a publish is getting on. */
export const DEPLOY_POLL_MS = 3000;

const PROBLEM_FIELDS = "path code message limit";
const SITE_FIELDS = `
  id accountName status addressName url audience look brandColour
  draft draftRevision hasUnpublishedChanges publishState publishedNumber
  publishedAt canUndo mayPublish publishRequestedAt
  publishProblems { ${PROBLEM_FIELDS} }
  canEditCompanyDetails
`;
const DEPLOY_FIELDS = "id status message url expiresAt";
const PICTURE_FIELDS = "id url width height description source";

/** The type of each argument the mutations take, by name. */
const ARGUMENTS = {
  siteId: "ID!",
  expectedRevision: "Int!",
  document: "JSONString!",
  audience: "String!",
  answers: "JSONString",
  look: "String",
  brandColour: "String",
  addressName: "String",
  file: "Upload!",
  description: "String!",
} as const;

type Variables = Partial<Record<keyof typeof ARGUMENTS, unknown>>;

type Answer = {
  success: boolean | null;
  code: string | null;
  message: string | null;
  problems: Problem[] | null;
};

/** The draft travels as text. */
type SentSite = Omit<Site, "draft"> & { draft: string };

const received = (site: SentSite): Site => ({
  ...site,
  draft: JSON.parse(site.draft) as SiteDocument,
});

const refusal = (answer: Answer): Refusal => ({
  ok: false,
  code: answer.code ?? "unexpected",
  message: answer.message ?? "Something went wrong. Please try again.",
  problems: answer.problems ?? [],
});

/** Runs one of the editor's mutations, asking for `fields` besides how it went. */
async function mutate<Extra>(
  name: string,
  variables: Variables,
  fields: string,
  file?: File,
): Promise<Answer & Extra> {
  const names = Object.keys(variables) as (keyof typeof ARGUMENTS)[];
  const declared = names.map((each) => `$${each}: ${ARGUMENTS[each]}`);
  const passed = names.map((each) => `${each}: $${each}`);
  const data = await graphql<Record<string, Answer & Extra>>(
    `mutation(${declared.join(", ")}) {
      ${name}(${passed.join(", ")}) {
        success code message problems { ${PROBLEM_FIELDS} }
        ${fields}
      }
    }`,
    variables,
    { file },
  );
  return data[name];
}

async function changeSite(
  name: string,
  variables: Variables,
): Promise<SiteResult> {
  const answer = await mutate<{ website: SentSite | null }>(
    name,
    variables,
    `website { ${SITE_FIELDS} }`,
  );
  return answer.success && answer.website
    ? { ok: true, site: received(answer.website) }
    : refusal(answer);
}

/** The account's website, or null when it has none. The backend allows one per account for now. */
export async function findSite(): Promise<Site | null> {
  const data = await graphql<{ websites: SentSite[] }>(
    `query { websites { ${SITE_FIELDS} } }`,
  );
  return data.websites.length > 0 ? received(data.websites[0]) : null;
}

/** `quiet` leaves the loading indicator alone, for asking again and again. */
export async function readSite(
  id: string,
  { quiet = false } = {},
): Promise<Site | null> {
  const data = await graphql<{ website: SentSite | null }>(
    `query($id: ID!) { website(id: $id) { ${SITE_FIELDS} } }`,
    { id },
    { quiet },
  );
  return data.website ? received(data.website) : null;
}

export async function readRules(): Promise<Rules> {
  const data = await graphql<{ websiteRules: string }>(
    "query { websiteRules }",
  );
  return JSON.parse(data.websiteRules) as Rules;
}

/** Whether this address can be taken. Quiet, so checking while someone types does not flash the page. */
export async function checkAddress(name: string): Promise<AddressCheck> {
  const data = await graphql<{ websiteAddressCheck: AddressCheck }>(
    `
      query ($name: String!) {
        websiteAddressCheck(name: $name) {
          available
          problem
          suggestion
        }
      }
    `,
    { name },
    { quiet: true },
  );
  return data.websiteAddressCheck;
}

/** The shape, then the backend. A taken name comes back with another name that is free. */
export async function confirmAddress(name: string): Promise<AddressVerdict> {
  const problem = addressError(name);
  if (problem) return { ok: false, problem, suggestion: null };
  const check = await checkAddress(name);
  if (check.available) return { ok: true };
  return {
    ok: false,
    problem: check.problem ?? "This address name is taken.",
    suggestion: check.suggestion,
  };
}

/** Creates the site at `addressName`. A taken name is refused, never swapped for another. */
export async function createSite({
  audience,
  answers,
  look,
  brandColour,
  addressName,
}: {
  audience: Audience;
  answers: Answers;
  look: Look;
  brandColour: string;
  addressName: string;
}): Promise<CreateResult> {
  const answer = await mutate<{
    website: SentSite | null;
    leftOut: string[];
    suggestion: string | null;
  }>(
    "websiteCreate",
    {
      audience,
      answers: JSON.stringify({ ...answers, look }),
      brandColour,
      addressName,
    },
    `leftOut suggestion website { ${SITE_FIELDS} }`,
  );
  return answer.success && answer.website
    ? { ok: true, site: received(answer.website), leftOut: answer.leftOut }
    : { ...refusal(answer), suggestion: answer.suggestion ?? null };
}

export const saveDraft = ({
  siteId,
  document,
  expectedRevision,
}: {
  siteId: string;
  document: SiteDocument;
  expectedRevision: number;
}) =>
  changeSite("websiteSaveDraft", {
    siteId,
    document: JSON.stringify(document),
    expectedRevision,
  });

export const setLook = (variables: {
  siteId: string;
  expectedRevision: number;
  look: Look;
  brandColour: string;
}) => changeSite("websiteSetLook", variables);

type AtRevision = { siteId: string; expectedRevision: number };

export const publish = (variables: AtRevision) =>
  changeSite("websitePublish", variables);

export const askToPublish = (variables: AtRevision) =>
  changeSite("websiteAskToPublish", variables);

export const undoPublish = (siteId: string) =>
  changeSite("websiteUndoPublish", { siteId });

export const switchOff = (siteId: string) =>
  changeSite("websiteSwitchOff", { siteId });

export const switchOn = (siteId: string) =>
  changeSite("websiteSwitchOn", { siteId });

export async function startPreview(siteId: string): Promise<DeployResult> {
  const answer = await mutate<{ deploy: Deploy | null }>(
    "websitePreview",
    { siteId },
    `deploy { ${DEPLOY_FIELDS} }`,
  );
  return answer.success && answer.deploy
    ? { ok: true, deploy: answer.deploy }
    : refusal(answer);
}

export async function readDeploy(id: string): Promise<Deploy | null> {
  const data = await graphql<{ websiteDeploy: Deploy | null }>(
    `query($id: ID!) { websiteDeploy(id: $id) { ${DEPLOY_FIELDS} } }`,
    { id },
    { quiet: true },
  );
  return data.websiteDeploy;
}

export async function readPictures(): Promise<Picture[]> {
  const data = await graphql<{ websitePictures: Picture[] }>(
    `query { websitePictures { ${PICTURE_FIELDS} } }`,
  );
  return data.websitePictures;
}

export async function uploadPicture({
  file,
  description,
}: {
  file: File;
  description: string;
}): Promise<PictureResult> {
  const answer = await mutate<{ picture: Picture | null }>(
    "websiteUploadPicture",
    { file: null, description },
    `picture { ${PICTURE_FIELDS} }`,
    file,
  );
  return answer.success && answer.picture
    ? { ok: true, picture: answer.picture }
    : refusal(answer);
}

export async function readLeads(variables: {
  offset: number;
  limit: number;
}): Promise<LeadPage> {
  const data = await graphql<{ websiteLeads: LeadPage }>(
    `
      query ($offset: Int, $limit: Int) {
        websiteLeads(offset: $offset, limit: $limit) {
          totalCount
          leads {
            id
            kind
            name
            phone
            who
            buildingLocation
            unitCount
            message
            page
            createdAt
          }
        }
      }
    `,
    variables,
  );
  return data.websiteLeads;
}
