import "server-only";
import { headers } from "next/headers";

export async function siteOrigin(): Promise<string> {
  const fixed = process.env.PM_SITES_CANONICAL_ORIGIN;
  if (fixed) return fixed.replace(/\/$/, "");

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
