# Backend dependency: `publicVacancies`

PM-Sites needs one thing from the Bomahut backend that does not exist today: an
**anonymous, read-only** vacancy feed. Every resolver in `pms/schema.py` is
currently behind `logged_in_landlord_required`, `logged_in_tenant_required` or a
sibling decorator, so there is no path a public website can take.

## Why not just use a service login?

It works, and it is what `BOMAHUT_API_TOKEN` is for as a stopgap. It is wrong as
the permanent answer:

- A viewer-role JWT still unlocks the entire authenticated schema — tenants,
  balances, payments — to whatever holds it. A leaked Vercel env var is a data
  breach, not a defacement.
- `tokenAuth` writes a `RefreshToken` row on every login. That is a write to
  production from a system that is supposed to be read-only.
- Tokens expire. A public marketing site should not have an auth failure mode.

## Proposed query

```graphql
type PublicVacantUnit {
  id: ID!            # hashed, per PublicIdentifierMixin
  unitName: String!
  rentAmount: Float!
}

type PublicVacantProperty {
  id: ID!
  name: String!
  city: String
  addressStreet: String
  currency: String!
  vacantUnits: [PublicVacantUnit!]!
}

type Query {
  publicVacancies(accountNumber: String!): [PublicVacantProperty!]!
}
```

Resolution:

```
CustomerAccount.objects.get(account_number=accountNumber, is_active=True)
  → Property.objects.filter(customer_account=account, is_active=True)
    → Unit.objects.filter(property__in=properties, tenant__isnull=True)
```

Vacancy is `tenant__isnull=True`, matching the existing
`PropertyType.resolve_vacancies` — not the `Unit.occupied` column, which is
maintained separately and can drift.

## What it must not expose

The whole risk of a public read path is inference. This query returns unit
names, rents and vacancy only. It must not expose, directly or by omission:

- Tenant names, phone numbers, balances or any `Tenant` field
- Occupied units (returning them would publish exactly which units are lived in)
- Landlord identity, management fees, M-PESA shortcodes, bank details
- Any property on an inactive or unpaid account

## Gating

A property is only publishable when its account has opted in. Two options, in
increasing order of correctness:

1. **Account-level flag** — one boolean on `CustomerAccount`
   (`public_site_enabled`). Fastest to ship, and enough for the pilot.
2. **Per-property publish toggle** — `Property.publish_to_website`, which is
   what the founder brief calls the "shopfront". This is where it should end up:
   a manager will not want every building on the public site.

Ship (1) for ABC Properties; (2) belongs with the shopfront/listing model that carries
photos and descriptions.

## Hardening

- **CORS is not the gate.** PM-Sites calls this server-side from Vercel, so
  `CORS_ALLOWED_ORIGIN_REGEXES` is never consulted. Do not widen it for this.
- **Rate limit by IP** on the public query specifically; the authenticated
  schema's assumptions do not apply to an unauthenticated one.
- **Cache** the resolver output (5 minutes matches the site's `revalidate`), so
  a traffic spike cannot become database load.
- **Depth limits** already exist via `DepthAnalysisFileUploadGraphQLView`, but
  confirm they apply on the anonymous path too.
- **Scraping is expected.** The data is public by intent; the thing to protect
  is the database, not the listings.

## Migration path

The marketing layer in `src/clients/<slug>/listings.ts` is deliberately shaped
like a future API response. When the backend grows a shopfront model with
photos, descriptions, amenities and bedroom counts, `publicVacancies` returns
those fields, `ListingContent` moves behind the API, and only
`src/lib/listings/source.ts` changes on the site.
