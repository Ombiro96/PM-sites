import { useEffect, useState } from "react";
import { CardSkeletons, HouseCardView } from "@/components/listings/HouseViews";
import { UNAVAILABLE } from "@/components/sections/Houses";
import { ActionLink } from "@/components/ui";
import { searchHouses } from "@/lib/listings/api";
import { useListings } from "@/lib/listings/context";
import { money } from "@/lib/listings/format";
import type {
  FilterChoices,
  SearchFilters,
  SearchResult,
} from "@/lib/listings/types";
import { navigate } from "@/lib/router";
import { resolveAction, useActionContext, useSite } from "@/lib/site/context";
import { HOUSES_PATH, houseWords } from "@/lib/site/pages";

const PAGE_SIZE = 12;
const RENT_STEPS = [
  5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 150000, 200000,
  300000, 500000,
];
const SORTS = [
  ["", "Newest first"],
  ["rent_asc", "Rent: low to high"],
  ["rent_desc", "Rent: high to low"],
];
const FALLBACK_TYPES: [string, string][] = [
  ["single_room", "Single room"],
  ["bedsitter", "Bedsitter"],
  ["studio", "Studio"],
  ["1_bedroom", "1 bedroom"],
  ["2_bedroom", "2 bedroom"],
  ["3_bedroom", "3 bedroom"],
  ["4_plus_bedroom", "4+ bedroom"],
];

type Filters = {
  type: string;
  max_rent: string;
  area: string;
  sort: string;
  page: number;
};

export function readFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  const page = Number(params.get("page"));
  return {
    type: params.get("type") ?? "",
    max_rent: /^\d+$/.test(params.get("max_rent") ?? "")
      ? (params.get("max_rent") as string)
      : "",
    area: params.get("area") ?? "",
    sort:
      params.get("sort") === "rent_asc" || params.get("sort") === "rent_desc"
        ? (params.get("sort") as string)
        : "",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

function filtersHref(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.max_rent) params.set("max_rent", filters.max_rent);
  if (filters.area) params.set("area", filters.area);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `${HOUSES_PATH}?${query}` : HOUSES_PATH;
}

/** The choices each filter offers, from everything this manager has to let. */
function options(choices: FilterChoices | null) {
  if (!choices || choices.categories.length === 0)
    return {
      types: FALLBACK_TYPES,
      areas: [] as [string, string][],
      rents: RENT_STEPS,
    };
  const lowest = Number(choices.lowest_rent);
  const highest = Number(choices.highest_rent);
  const top = RENT_STEPS.find((step) => step >= highest) ?? Infinity;
  return {
    types: choices.categories.map(({ value, label }): [string, string] => [
      value,
      label,
    ]),
    areas: choices.locations.map(({ id, name }): [string, string] => [
      id,
      name,
    ]),
    rents:
      lowest > 0 && highest > 0
        ? RENT_STEPS.filter((step) => step >= lowest && step <= top)
        : RENT_STEPS,
  };
}

type State =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; result: SearchResult };

/** Houses to let: filters, a count, cards and pages of results, all from the live feed. */
export function HousesPage({ search }: { search: string }) {
  const site = useSite();
  const context = useActionContext();
  const summary = useListings();
  const words = houseWords(site.site.look);
  const filters = readFilters(search);
  const key = filtersHref(filters);
  const [loaded, setLoaded] = useState<{ key: string; state: State } | null>(
    null,
  );
  const state: State =
    loaded?.key === key ? loaded.state : { status: "loading" };

  useEffect(() => {
    let current = true;
    const query: SearchFilters = {
      category: filters.type,
      max_rent: filters.max_rent,
      location: filters.area,
      sort: filters.sort,
      page: filters.page,
      page_size: PAGE_SIZE,
    };
    searchHouses(site.api, query)
      .then(
        (result) =>
          current && setLoaded({ key, state: { status: "ready", result } }),
      )
      .catch(() => current && setLoaded({ key, state: { status: "failed" } }));
    return () => {
      current = false;
    };
    // `key` stands for every filter value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, site.api]);

  const choose =
    (name: keyof Filters) => (event: { target: { value: string } }) =>
      navigate(
        filtersHref({ ...filters, [name]: event.target.value, page: 1 }),
        { replace: true, keepScroll: true },
      );

  const choices = options(summary.status === "ready" ? summary.filters : null);
  const filtered = Boolean(filters.type || filters.max_rent || filters.area);
  const nothingToLet = summary.status === "ready" && summary.count === 0;
  const call = resolveAction({ kind: "call" }, "Call us", context);
  const whatsapp = site.facts.whatsapp
    ? resolveAction({ kind: "whatsapp" }, "WhatsApp us", context)
    : null;

  return (
    <section className="sec pagehd">
      <div className="in">
        <div className="headg">
          <span className="eyebrow">To let</span>
          <h1 className="ltitle">{words.title}</h1>
        </div>

        {nothingToLet || state.status === "failed" ? null : (
          <form
            className="filters"
            onSubmit={(event) => event.preventDefault()}
          >
            {choices.areas.length > 1 || filters.area ? (
              <div className="fl">
                <label htmlFor="f-area">Area</label>
                <select
                  id="f-area"
                  value={filters.area}
                  onChange={choose("area")}
                >
                  <option value="">All areas</option>
                  {choices.areas.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="fl">
              <label htmlFor="f-type">House type</label>
              <select
                id="f-type"
                value={filters.type}
                onChange={choose("type")}
              >
                <option value="">Any type</option>
                {choices.types.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label htmlFor="f-rent">Rent up to</label>
              <select
                id="f-rent"
                value={filters.max_rent}
                onChange={choose("max_rent")}
              >
                <option value="">Any rent</option>
                {choices.rents.map((rent) => (
                  <option key={rent} value={rent}>
                    {money(rent)}
                  </option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label htmlFor="f-sort">Sort by</label>
              <select
                id="f-sort"
                value={filters.sort}
                onChange={choose("sort")}
              >
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        )}

        {state.status === "loading" ? (
          <>
            <p className="meta" role="status">
              Loading…
            </p>
            <CardSkeletons count={6} />
          </>
        ) : state.status === "failed" ? (
          <div className="notice" role="status">
            <b>{UNAVAILABLE}</b>
            <span className="meta">
              We could not load the {words.many} to let just now. Please try
              again shortly, or contact us and we will tell you what is free.
            </span>
            <div className="row">
              <ActionLink button={whatsapp} className="wa sm" />
              <ActionLink button={call} className="line sm" />
            </div>
          </div>
        ) : state.result.count === 0 ? (
          <div className="notice" role="status">
            <b>
              {filtered
                ? `No ${words.many} match those choices`
                : `No ${words.many} to let right now`}
            </b>
            <span className="meta">
              {filtered
                ? "Try a different area, type or rent."
                : "Nothing is advertised at the moment. Contact us and we will tell you when something comes up."}
            </span>
            <div className="row">
              {filtered ? (
                <a className="btn sm" href={HOUSES_PATH}>
                  Show all {words.many}
                </a>
              ) : null}
              <ActionLink button={whatsapp} className="wa sm" />
              <ActionLink button={call} className="line sm" />
            </div>
          </div>
        ) : (
          <>
            <p className="meta" role="status">
              {state.result.count}{" "}
              {state.result.count === 1 ? words.one : words.many}
              {filtered ? " match" : " to let"}
            </p>
            <div className="grid3">
              {state.result.results.map((house) => (
                <HouseCardView key={house.id} house={house} words={words} />
              ))}
            </div>
            {state.result.num_pages > 1 ? (
              <nav className="pager" aria-label="Pages of results">
                {state.result.page > 1 ? (
                  <a
                    className="btn line sm"
                    href={filtersHref({
                      ...filters,
                      page: state.result.page - 1,
                    })}
                  >
                    Previous
                  </a>
                ) : null}
                <span className="meta">
                  Page {state.result.page} of {state.result.num_pages}
                </span>
                {state.result.page < state.result.num_pages ? (
                  <a
                    className="btn line sm"
                    href={filtersHref({
                      ...filters,
                      page: state.result.page + 1,
                    })}
                  >
                    Next
                  </a>
                ) : null}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
