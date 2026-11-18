# PM-Sites

The website a property manager gets from Bomahut. **One static app draws every
manager's site**, in any of the sixteen looks, from data the backend writes into
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

| Address part                             | Does                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `?sample=tembo-hart` or `sunrise-court`  | Which sample (default `tembo-hart`, the full one; `sunrise-court` is the thin one)                                              |
| `?look=fresh\|classic\|…\|neon\|collage` | Draw the sample in another look                                                                                                 |
| `?colour=1d4e89`                         | Another brand colour                                                                                                            |
| `?listings=sample\|few\|empty`           | Made-up houses instead of a backend                                                                                             |
| `/__sections?look=…&only=steps,figures`  | Every section type in every layout and background, with the longest allowed text, a very long company name and missing pictures |

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

There are sixteen: `fresh`, `classic`, `bold`, `coast`, `estate`, `plain`, and
ten added later, `midnight`, `studio`, `parchment`, `lab`, `moss`, `dusk`,
`gallery`, `catalogue`, `neon` and `collage`. The names are listed in
`src/lib/site/data.ts`; a look whose page is not white also gives its page
colour in `brand.ts`. The backend keeps its own list (`websites/section_rules.py`
and the `Site` model) and refuses a look it does not know, so the ten are not
usable on a real site until they are added there.

## Rules the code keeps

- Manager text is never rendered as HTML.
- Addresses are only built from typed button destinations, and from picture,
  logo and social addresses that are plain `https`.
- A picture that is missing from the page's data draws the no-picture design.
- Hidden sections and section types the app does not know draw nothing.
- Every form has a hidden `website` field that must stay empty.

## The console

`console/` is a second, separate app in this repo: where a manager signs in or
creates an account, sets up their website and then runs it. It has its own
build (`vite.console.config.ts`), so a site build never carries it.

```bash
npm run dev:console      # http://localhost:5174
npm run test:console
npm run build:console    # dist-console/
```

It talks to the backend named in `VITE_CONSOLE_API_BASE` (see `.env.example`).

**Setup** (`/setup/<step>`) is gone through once, by an account with no website:

| Step         | Does                                                                                            | Kept                                              |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Sign in      | `tokenAuth`, `register`, `sendPasswordResetEmail` and `passwordReset`, exactly as the dashboard | The backend                                       |
| Theme        | One of the sixteen looks                                                                        | This browser, until the last step                 |
| Theme colour | The brand colour                                                                                | This browser, until the last step                 |
| Details      | Company name, phone, WhatsApp; who the site is for                                              | `saveAgencyProfile`; the audience in this browser |
| About you    | What the first draft is written from: About text, services, whether to show figures             | This browser, until the last step                 |
| Review       | Everything chosen, each line changeable. "Write my first draft" creates the website             | `createSite`, then `setLook`                      |

**The console** (`/website/<view>`) is what an account with a website sees:

| View            | Does                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Edit pages      | The page drawn live beside its list of sections. Clicking a section, in either, opens its form |
| Pictures        | Upload, and see which pages use each picture                                                   |
| Company details | The same fields as setup, and the tick that they may be public                                 |
| Theme           | The look, as in setup, drawn on the manager's own pages                                        |
| Theme colour    | The brand colour, as in setup, drawn on the manager's own pages                                |
| Go live         | What still blocks publishing, asking Bomahut to switch publishing on, and Publish              |
| Enquiries       | Messages and management requests from the site                                                 |
| Settings        | The address, undoing the last publish, switching the site off and on                           |

Preview and Publish are in the header on every view.

**The backend calls are stood in for.** The editor API planned in backend issue
#1313 is not built, so `console/src/lib/site.ts` (the types, and one function
per planned call) hands every call to `console/src/lib/standin/api.ts`, which
keeps the website in this browser's storage per signed-in user. Each stand-in
has the arguments and refusal codes of the call that replaces it. To connect
the backend, write the real calls and change the export at the foot of
`site.ts`; the screens do not change. What the stand-in makes up:

- the first draft is the contract's sample pages under the manager's name;
- `standin/rules.json` is a copy of the backend's `rules_as_data()`;
- a preview opens the stored draft in a new tab, from this same app;
- pictures are shrunk and kept in browser storage, so only a few fit;
- enquiries are four made-up ones;
- "Bomahut switches on publishing" is a button on Go live, in the dev server only.

Company details are real: `agencyProfile` and `saveAgencyProfile` exist.

**The preview is the real site.** `console/preview.html` loads the site app
from `src/` in a frame, and the console sends it site data with `postMessage`
(`console/src/components/SitePreview.tsx`). In setup it draws the full sample
from `src/dev/` in the manager's look and colour. In the console it draws the
manager's own draft as they type, and a click on a section is reported back
to the console. Houses are made up and figures are examples there, because
only a real preview or publish fills them in.

```
console/index.html, preview.html   the console, and the frame that draws a site
console/src/pages/                 sign in, create account, setup, the console and its views
console/src/components/            form fields, the section form, the site preview
console/src/lib/                   backend calls, sign-in state, setup choices, the draft being edited
console/src/lib/standin/           the editor API kept in the browser, until the backend has it
```
