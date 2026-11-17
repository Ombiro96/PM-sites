# PM-Sites

The website a property manager gets from Bomahut. **One static app draws every
manager's site**, in any of the six looks, from data the backend writes into
the page when the site is published.

- **Stack:** Vite, React 19, Tailwind 4, TypeScript. No server, no router library.
- **Hosting:** static files on S3 behind CloudFront. The backend's `websites`
  app copies a build into each site's folder and fills in the page.
- **Live data:** houses to let are fetched in the visitor's browser from the
  backend's public listings endpoints. Enquiries and site forms post to the backend.

The contract this app follows is `docs/pm-websites-contract.md` and
`docs/pm-websites-static-build-plan.md` in the workspace; the section rules are
`backend/websites/section_rules.py`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server has no backend in front of it, so it draws a sample site. Choose
what to draw in the address:

| Address part                                       | Does                                                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `?sample=tembo-hart` or `sunrise-court`            | Which sample (default `tembo-hart`, the full one; `sunrise-court` is the thin one)                                              |
| `?look=fresh\|classic\|bold\|coast\|estate\|plain` | Draw the sample in another look                                                                                                 |
| `?colour=1d4e89`                                   | Another brand colour                                                                                                            |
| `?listings=sample\|few\|empty`                     | Made-up houses instead of a backend                                                                                             |
| `/__sections?look=…&only=steps,figures`            | Every section type in every layout and background, with the longest allowed text, a very long company name and missing pictures |

Without `?listings=` the samples ask a real backend, set in `.env.local`
(see `.env.example`):

```bash
VITE_DEV_API_BASE=http://localhost:8000/api
VITE_DEV_AGENCY=<an agency slug on that backend>
```

With neither, the houses sections show their "availability is temporarily
unavailable" state, which is the right thing to see when checking that state.

Sample sites, made-up listings and the test page live in `src/dev/` and are
loaded only by the dev server. A build contains none of them.

## Checks

```bash
npm run typecheck
npm run lint
npm test             # router, button destinations, reading page data, picture lookup
npm run build
```

## Build and upload

```bash
npm run build        # dist/index.html + hashed files under dist/assets/
```

The build is uploaded by the backend, which refuses to overwrite a version:

```bash
# in the backend repo
python manage.py upload_site_app <version> <path to PM-sites/dist>
```

Publishing a site then copies that version's files and writes the pages.

## How data gets into the page

`index.html` keeps two placeholders, and the build leaves them exactly as written:

- `%SITE_HEAD%` inside `<head>`: the backend replaces it with the page's title,
  description, canonical address and link-preview tags.
- `%SITE_DATA%` inside `<div hidden>`: the backend replaces it with
  `<script id="site-data" type="application/json">…</script>`.

The data is one object (`SiteData` in `src/lib/site/types.ts`):

```
version   1
site      id, address, look, brand_colour, show_credit, preview
facts     name, logo, phone, whatsapp, email, office_address, opening_hours,
          latitude, longitude, social_links, areas_served
figures   buildings, units, towns
pictures  { <asset id>: { small, large } }
wording   { services: { <standard service key>: { title, text } } }
document  the published document: header, footer, pages[] of sections
api       base (the backend's /api address), agency (the listings agency slug)
```

If there is no data in the page the app shows "This site is not available".
When the head placeholder left no title, the app sets the tab title itself.

## Pages and paths

| Path                                     | Drawn from                                                     |
| ---------------------------------------- | -------------------------------------------------------------- |
| `/`, `/for-owners`, `/about`, `/contact` | The document. A page the document lacks shows "page not found" |
| `/houses`                                | Listings search: filters, count, pages of results              |
| `/houses/<short code or id>`             | One house type                                                 |

Paths are real paths. `src/lib/router.ts` takes over same-site link clicks,
uses the history API, scrolls to the top, and scrolls to a section when a
button's destination is one.

## What the app calls

| Call                                                        | Used for                                                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET {api.base}/listings/v1/search/?agency=…`               | Houses sections, buildings, the houses badge and figure, the houses page (`category`, `max_rent`, `location`, `sort`, `page`, `page_size`) |
| `GET {api.base}/listings/v1/unit-types/<id>/`               | One house                                                                                                                                  |
| `GET {api.base}/listings/v1/links/r/<code>/`                | Turns a short code in the address into an id                                                                                               |
| `POST {api.base}/listings/v1/enquiries/`                    | Rental enquiry, and WhatsApp and Call taps on a house                                                                                      |
| `POST {api.base}/websites/v1/public/sites/<site id>/leads/` | Management request and contact message                                                                                                     |

When listings cannot be reached the site says "Availability is temporarily
unavailable" and never "no houses". With no houses at all, the houses section
on a page is not drawn and buttons that pointed at houses go to Contact.

## Where things are

```
index.html                    the page with the two placeholders
src/main.tsx                  reads the data, sets the look, starts the app
src/App.tsx                   header, the page for the current path, footer
src/styles/site.css           look tokens (.look-*) and every section's styling
src/lib/site/                 data shape, pages, button destinations, pictures, brand colours
src/lib/listings/             listings requests, their shapes, formatting
src/lib/router.ts             paths and link handling
src/components/sections/      the 17 sections and SectionRenderer
src/components/pages/         stored page, houses, one house, not found
src/components/forms/         enquiry form, lead form, shared field parts
src/dev/                      samples, made-up listings, the /__sections test page (dev server only)
```

## Looks

A look is a class on `<html>` (`look-classic`) plus colours derived from the
manager's one brand colour (`src/lib/site/brand.ts`). Each look is a set of
tokens and a few section overrides in `src/styles/site.css`; no section has
per-look markup. Fonts are bundled with the app.

## Rules the code keeps

- Manager text is never rendered as HTML.
- Addresses are only built from typed button destinations, and from picture,
  logo and social addresses that are plain `https`.
- A picture that is missing from the page's data draws the no-picture design.
- Hidden sections and section types the app does not know draw nothing.
- Every form has a hidden `website` field that must stay empty.
