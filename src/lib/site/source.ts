import "server-only";
import { cache } from "react";
import { sunriseCourt } from "@/samples/sunrise-court";
import { temboHart } from "@/samples/tembo-hart";
import type { SiteData } from "./types";

const SAMPLES: Record<string, SiteData> = {
  "tembo-hart": temboHart,
  "sunrise-court": sunriseCourt,
};

/**
 * The one place a site's data comes from. Today it is a sample chosen by
 * PM_SITES_SAMPLE; it becomes a backend call keyed on the request hostname.
 */
export const getSite = cache(async (): Promise<SiteData> => {
  const sample = process.env.PM_SITES_SAMPLE ?? "tembo-hart";
  return SAMPLES[sample] ?? temboHart;
});
