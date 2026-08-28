import type { MetadataRoute } from "next";
import { resolveClient, canonicalOrigin } from "@/lib/brand/resolve";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const client = await resolveClient();
  const origin = canonicalOrigin(client);

  // Preview deployments must never be indexed — they would compete with the
  // client's own domain for the same content.
  const isPreview = process.env.VERCEL_ENV === "preview";

  return {
    rules: isPreview
      ? [{ userAgent: "*", disallow: "/" }]
      : [{ userAgent: "*", allow: "/", disallow: ["/api/", "/tenant-portal"] }],
    sitemap: isPreview ? undefined : `${origin}/sitemap.xml`,
    host: isPreview ? undefined : origin,
  };
}
