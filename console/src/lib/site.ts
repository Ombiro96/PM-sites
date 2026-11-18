import type { Look, SiteDocument } from "@/lib/site/types";
import type { Audience } from "./website";

/**
 * A manager's website as the editor API gives it, and every call the console
 * makes about it. The shapes follow the plan in backend issue #1313.
 *
 * The backend has none of these calls yet, so the last line of this file hands
 * them to `standin/api.ts`, which keeps everything in this browser. Each
 * function there is named after the call that replaces it; pointing that line
 * at the real calls is the whole change.
 */
export type SiteStatus = "OFF" | "DRAFT" | "LIVE";

export type Problem = { path: string; code: string; message: string };

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
  /** `stale`, `not_ready`, `not_allowed`, `already_asked` and the rest of the plan's list. */
  code: string;
  message: string;
  problems: Problem[];
};

export type SiteResult = { ok: true; site: Site } | Refusal;

export type Picture = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  description: string;
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
/** How often to ask how a preview is getting on, as the plan advises. */
export const DEPLOY_POLL_MS = 3000;

export {
  askToPublish,
  confirmCompanyPublic,
  createSite,
  publish,
  readDeploy,
  readLeads,
  readPictures,
  readRules,
  readSite,
  saveDraft,
  setLook,
  startPreview,
  switchOff,
  switchOn,
  undoPublish,
  uploadPicture,
} from "./standin/api";
