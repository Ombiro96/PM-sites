import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { subscribe } from "@/lib/router";
import type { SiteData } from "@/lib/site/types";
import { getAgencyOverview } from "./api";
import type { Building, FilterChoices, HouseCard } from "./types";

/** How many houses the home-page sections are drawn from. Buildings and filter choices come complete. */
const SUMMARY_SIZE = 50;

export type Listings =
  | { status: "loading" }
  | { status: "failed" }
  | {
      status: "ready";
      count: number;
      houses: HouseCard[];
      buildings: Building[];
      filters: FilterChoices;
    };

const ListingsContext = createContext<Listings>({ status: "loading" });

/**
 * Asks for the manager's houses to let; every section shares the answer. It
 * asks again when the visitor moves to another page, which reaches the backend
 * only once the last answer is no longer fresh.
 */
export function ListingsProvider({
  api,
  children,
}: {
  api: SiteData["api"];
  children: ReactNode;
}) {
  const [listings, setListings] = useState<Listings>({ status: "loading" });

  useEffect(() => {
    let current = true;
    const load = (first: boolean) =>
      getAgencyOverview(api, SUMMARY_SIZE)
        .then((overview) => {
          if (current)
            setListings({
              status: "ready",
              count: overview.listings.count,
              houses: overview.listings.results,
              buildings: overview.buildings,
              filters: overview.filters,
            });
        })
        .catch(() => {
          // A refresh that fails keeps what is already showing.
          if (current && first) setListings({ status: "failed" });
        });
    void load(true);
    const stop = subscribe(() => void load(false));
    return () => {
      current = false;
      stop();
    };
  }, [api]);

  return (
    <ListingsContext.Provider value={listings}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings(): Listings {
  return useContext(ListingsContext);
}
