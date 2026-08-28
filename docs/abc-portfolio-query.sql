-- Read-only lookup of ABC Properties' portfolio, to replace the placeholder content in
-- src/clients/abc/listings.ts with the real thing.
--
-- Run it yourself against production (the assistant is blocked from psql):
--
--   cd ~/bomahut
--   set -a && . ./prod.sh && set +a
--   psql "$DATABASE_URL" -f PM-Sites/docs/abc-portfolio-query.sql
--
-- Everything below runs inside READ ONLY; the transaction cannot write even if
-- a statement tried to.

\set ON_ERROR_STOP on
BEGIN READ ONLY;

\echo '== Account =='
SELECT ca.id,
       ca.account_number,
       c.company_name,
       c.company_short_name,
       c.address,
       ca.currency,
       ca.num_units,
       ca.is_active
FROM api_customeraccount ca
LEFT JOIN api_company c ON c.customer_account_id = ca.id
WHERE c.company_name ILIKE '%abc%'
   OR c.company_short_name ILIKE '%abc%';

\echo '== Properties =='
SELECT p.id,
       p.name,
       p.city,
       p.address_street,
       p.unit_count,
       p.is_active,
       count(u.id)                                      AS units,
       count(u.id) FILTER (WHERE t.id IS NULL)          AS vacant
FROM api_property p
JOIN api_customeraccount ca ON ca.id = p.customer_account_id
LEFT JOIN api_company c     ON c.customer_account_id = ca.id
LEFT JOIN api_unit u        ON u.property_id = p.id
LEFT JOIN api_tenant t      ON t.unit_id = u.id
WHERE c.company_name ILIKE '%abc%'
   OR c.company_short_name ILIKE '%abc%'
GROUP BY p.id, p.name, p.city, p.address_street, p.unit_count, p.is_active
ORDER BY p.name;

\echo '== Vacant units (this is what the public API will return) =='
SELECT p.name AS property,
       u.unit_name,
       u.rent_amount
FROM api_unit u
JOIN api_property p         ON p.id = u.property_id
JOIN api_customeraccount ca ON ca.id = p.customer_account_id
LEFT JOIN api_company c     ON c.customer_account_id = ca.id
LEFT JOIN api_tenant t      ON t.unit_id = u.id
WHERE (c.company_name ILIKE '%abc%' OR c.company_short_name ILIKE '%abc%')
  AND t.id IS NULL
ORDER BY p.name, u.unit_name;

\echo '== Rent bands per property (helps define unit types) =='
SELECT p.name AS property,
       u.rent_amount,
       count(*) AS units
FROM api_unit u
JOIN api_property p         ON p.id = u.property_id
JOIN api_customeraccount ca ON ca.id = p.customer_account_id
LEFT JOIN api_company c     ON c.customer_account_id = ca.id
WHERE c.company_name ILIKE '%abc%'
   OR c.company_short_name ILIKE '%abc%'
GROUP BY p.name, u.rent_amount
ORDER BY p.name, u.rent_amount;

COMMIT;
