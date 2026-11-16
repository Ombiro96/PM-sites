import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site/origin";
import { HOUSES_PATH, PAGE_PATHS } from "@/lib/site/pages";
import { getSite } from "@/lib/site/source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  if (site.status !== "live") return [];
  const origin = await siteOrigin();

  const storedPages: MetadataRoute.Sitemap = site.document.pages.map(
    (page) => ({
      url: `${origin}${PAGE_PATHS[page.kind]}`,
      changeFrequency: page.kind === "home" ? "daily" : "monthly",
      priority: page.kind === "home" ? 1 : 0.6,
    }),
  );

  return [
    ...storedPages,
    { url: `${origin}${HOUSES_PATH}`, changeFrequency: "daily", priority: 0.9 },
  ];
}
