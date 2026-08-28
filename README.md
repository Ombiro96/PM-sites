# PM-Sites

Branded property-management websites, one codebase, many clients.

A property manager on Bomahut gets their own domain, brand and public listings
site. Vacancies are read live from the Bomahut GraphQL API; everything else —
colours, logo, copy, photography, areas, services — is data in
`src/clients/<slug>/`. **Onboarding client #2 must be a configuration change,
not a new project.** That constraint is the point of the whole repo.

- **Framework:** Next.js 16 (App Router) + React 19 + Tailwind 4
- **Hosting:** Vercel (one project, many custom domains)
- **Data:** read-only GraphQL against `api.bomahut.com`
- **Leads:** forwarded to Make.com; nothing is written back to Bomahut

## Read-only, by construction

This site never mutates production data. `src/lib/backend/client.ts` rejects any
GraphQL document containing `mutation` or `subscription` before it is sent, so a
write cannot be introduced by accident. Enquiries go to Make.com, not to the
Bomahut API.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000. With no matching host, the site renders
`PM_SITES_DEFAULT_CLIENT`. To exercise host resolution locally, add to
`/etc/hosts`:

```
127.0.0.1 abc.localhost
```

and visit http://abc.localhost:3000.

## How a request resolves

```
Host header  →  src/lib/brand/resolve.ts  →  Client { brand, listings }
                                              ├── brand.theme  → CSS variables on :root
                                              ├── brand.content → every word on the page
                                              └── brand.accountNumber → which vacancies to fetch
```

Every page is server-rendered on demand because the brand depends on the
`Host` header. Vacancy fetches are cached for 5 minutes
(`next: { revalidate: 300 }`), so traffic does not translate into backend load.

## Adding a client

1. `mkdir src/clients/<slug>` and copy `abc/brand.ts` + `abc/listings.ts`.
2. Fill in company details, contact, theme tokens, content and
   `accountNumber` (their Bomahut `CustomerAccount.account_number`).
3. Set `hosts` to their domain(s).
4. Register the client in `src/clients/index.ts`.
5. Drop logo artwork in `public/clients/<slug>/` and point `logos` at it. Until
   then the site renders a typographic wordmark — a brand can go live without
   waiting for artwork. The browser-tab and iOS icons (`src/app/icon.tsx`,
   `src/app/apple-icon.tsx`) are generated from `company.shortName` and
   `theme.primary`, so they are correct for a new client with no assets at all.
6. Add the domain to the Vercel project and point the client's DNS at it.

No component may reference a client by name. If you find yourself wanting to,
the thing you need is a new field on `Brand`.

### Theming

`src/lib/brand/theme.ts` turns brand tokens into CSS custom properties, and
`globals.css` maps those onto Tailwind utilities (`bg-brand`, `text-ink-muted`,
`rounded-brand`). Components only ever use the utilities. `contrastRatio()` and
`readableOn()` are there for when a property manager picks a colour that white
text cannot sit on.

## Listings: where the data comes from

A listing is a **unit type** ("2 Bedroom Apartment at Riverside Court"), not an
individual unit. Advertising per-unit would mean 40 near-identical pages for one
block, and would leak the occupancy of specific units.

| Field | Source |
|---|---|
| Availability, rent, property name, city | Bomahut, live, via `publicVacancies` |
| Photos, description, amenities, beds/baths, size | `src/clients/<slug>/listings.ts` |

`propertyMatch` must equal `Property.name` in Bomahut exactly — that is the join
key. `match` narrows which vacant units of that property belong to a given unit
type, by unit-name regex and/or rent band.

If the backend is unreachable the site still renders the full catalogue with
everything marked unavailable, and shows a notice on `/properties`. It never
shows an error page over a listings failure.

### Backend dependency

`publicVacancies(accountNumber:)` is an **anonymous, read-only** query that does
not exist in the backend yet. Its expected shape is in
`src/lib/backend/vacancies.ts`, and the backend-side design is in
`docs/backend-public-vacancies.md`. Until it ships, set `BOMAHUT_API_TOKEN` to a
viewer-role JWT, or run against fixtures.

## SEO

Location pages (`/areas/<slug>`) are first-class: "houses to rent in Kilimani"
is what people actually type. Each carries its own title, description, canonical
and `BreadcrumbList`. Listings emit `Apartment` + `Offer` structured data with
real availability, the site emits `RealEstateAgent`, and `/about` emits
`FAQPage`. Sitemap and robots are generated per brand; preview deployments are
`noindex` so they never compete with a client's own domain.

## Project layout

```
src/
  app/                    routes; every page resolves its brand from the Host header
    api/enquiry/          POST → Make.com (rate-limited, honeypot, zod-validated)
  clients/                per-client configuration — the only place a brand is named
  components/
    forms/ home/ layout/ listings/ seo/ ui/
  lib/
    backend/              read-only GraphQL client + vacancy query
    brand/                host resolution, types, theme → CSS variables
    listings/             types, marketing content model, merge, filtering
```

## Commands

```bash
npm run dev         # local dev server
npm run build       # production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run format      # prettier
```

## Before a second client goes live

`resolveClient()` currently falls back to a default brand for unknown hosts,
which is right while one client is live and wrong the moment two are: an unknown
host in production should 404 rather than silently serve someone else's brand.
Change that in `src/lib/brand/resolve.ts` when client #2 is onboarded.
