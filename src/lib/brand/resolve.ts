import { headers } from "next/headers";
import { clients, defaultClientSlug, type Client } from "@/clients";

function normaliseHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0];
}

const byHost = new Map<string, Client>(
  clients.flatMap((client) =>
    client.brand.hosts.map((host) => [normaliseHost(host), client] as const),
  ),
);

export function getClientByHost(host: string | null | undefined): Client | null {
  if (!host) return null;
  return byHost.get(normaliseHost(host)) ?? null;
}

export function getClientBySlug(slug: string): Client | null {
  return clients.find((client) => client.brand.slug === slug) ?? null;
}

/**
 * Resolves the property manager for the current request from the Host header.
 *
 * Unknown hosts fall back to `PM_SITES_DEFAULT_CLIENT` (or the default client)
 * so that Vercel preview URLs, `localhost` and the like still render something.
 * Once more than one client is live, an unknown host in production should be a
 * 404 rather than a silent fallback — see the note in the README.
 */
export async function resolveClient(): Promise<Client> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? null;

  const matched = getClientByHost(host);
  if (matched) return matched;

  const configured = process.env.PM_SITES_DEFAULT_CLIENT;
  if (configured) {
    const fallback = getClientBySlug(configured);
    if (fallback) return fallback;
    console.error(
      `[PM-Sites] PM_SITES_DEFAULT_CLIENT="${configured}" matches no client in src/clients. ` +
        `Known slugs: ${clients.map((c) => c.brand.slug).join(", ")}.`,
    );
  }

  // Never throw here. This runs on every route including robots.txt and
  // sitemap.xml, so a bad env var would take the whole site down rather than
  // one page. Serving a known brand is always better than serving 500s.
  return getClientBySlug(defaultClientSlug) ?? clients[0];
}

export async function resolveBrand() {
  return (await resolveClient()).brand;
}

/** Canonical origin for this brand, used for metadata and sitemaps. */
export function canonicalOrigin(client: Client): string {
  const override = process.env.PM_SITES_CANONICAL_ORIGIN;
  if (override) return override.replace(/\/$/, "");
  return `https://${client.brand.hosts[0]}`;
}
