import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site/origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await siteOrigin();

  // Preview deployments must never be indexed — they would compete with the
  // manager's own domain for the same content.
  const isPreview = process.env.VERCEL_ENV === "preview";

  return {
    rules: isPreview
      ? [{ userAgent: "*", disallow: "/" }]
      : [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: isPreview ? undefined : `${origin}/sitemap.xml`,
    host: isPreview ? undefined : origin,
  };
}
