import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  FRESH_FOR_MS,
  getAgencyOverview,
  getHouse,
  setFetcher,
} from "./api";

const API = { base: "https://backend.example/api", agency: "tembo-hart" };
const HOUSE_ID = "00000000-0000-4000-8000-000000000001";

function house(agency: string, extra: Record<string, unknown> = {}) {
  return {
    id: HOUSE_ID,
    short_code: "abc1",
    agency: { name: agency, slug: agency },
    other_unit_types: [],
    ...extra,
  };
}

/** Answers each address from a table; a missing address is a 404. Counts the requests. */
function backend(answers: Record<string, unknown>) {
  const state = { answers, calls: 0 };
  setFetcher(async (url) => {
    state.calls += 1;
    const path = url.replace(`${API.base}/listings/v1`, "");
    const body = state.answers[path];
    return new Response(JSON.stringify(body ?? { detail: "Not found." }), {
      status: body === undefined ? 404 : 200,
    });
  });
  return state;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("a house on a manager's site", () => {
  it("is shown when it is the manager's own", async () => {
    backend({ [`/unit-types/${HOUSE_ID}/`]: house("tembo-hart") });
    expect((await getHouse(API, HOUSE_ID)).id).toBe(HOUSE_ID);
  });

  it("is not found when it belongs to another company, by id or by short code", async () => {
    backend({
      [`/unit-types/${HOUSE_ID}/`]: house("another-company"),
      "/links/r/abc1/": { type: "unit_type", id: HOUSE_ID },
    });
    for (const idOrCode of [HOUSE_ID, "abc1"]) {
      const error = await getHouse(API, idOrCode).catch((caught) => caught);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
    }
  });

  it("is asked for again once the answer is no longer fresh", async () => {
    const state = backend({
      [`/unit-types/${HOUSE_ID}/`]: house("tembo-hart", {
        rent_amount: "45000.00",
      }),
    });
    await getHouse(API, HOUSE_ID);
    await getHouse(API, HOUSE_ID);
    expect(state.calls).toBe(1);

    // The rent changes, then the house is withdrawn.
    state.answers[`/unit-types/${HOUSE_ID}/`] = house("tembo-hart", {
      rent_amount: "50000.00",
    });
    vi.advanceTimersByTime(FRESH_FOR_MS + 1);
    expect((await getHouse(API, HOUSE_ID)).rent_amount).toBe("50000.00");

    delete state.answers[`/unit-types/${HOUSE_ID}/`];
    vi.advanceTimersByTime(FRESH_FOR_MS + 1);
    const error = await getHouse(API, HOUSE_ID).catch((caught) => caught);
    expect((error as ApiError).status).toBe(404);
  });
});

describe("the company's houses, buildings and filter choices", () => {
  it("come from one answer, including a building with nothing to let", async () => {
    backend({
      "/agencies/tembo-hart/?page_size=50": {
        listings: {
          count: 70,
          page: 1,
          page_size: 50,
          num_pages: 2,
          results: [],
        },
        buildings: [{ id: "b1", name: "Full House", unit_types_to_let: 0 }],
        filters: {
          categories: [{ value: "studio", label: "Studio" }],
          locations: [{ id: "l1", name: "Kilimani" }],
          lowest_rent: "9000.00",
          highest_rent: "95000.00",
        },
      },
    });
    const overview = await getAgencyOverview(API, 50);
    expect(overview.listings.count).toBe(70);
    expect(overview.buildings.map((building) => building.name)).toEqual([
      "Full House",
    ]);
    expect(overview.filters.categories).toHaveLength(1);
  });

  it("is empty, not failed, for a company that is not advertising", async () => {
    backend({});
    const overview = await getAgencyOverview(API, 50);
    expect(overview.listings.count).toBe(0);
    expect(overview.buildings).toEqual([]);
  });
});
