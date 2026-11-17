import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteData } from "@/lib/site/types";
import { searchHouses } from "./api";
import type { HouseCard } from "./types";

/** How many houses the home-page sections, figures and buildings are drawn from. */
const SUMMARY_SIZE = 50;

export type Listings =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; count: number; houses: HouseCard[] };

const ListingsContext = createContext<Listings>({ status: "loading" });

/** Asks once for the manager's houses to let; every section shares the answer. */
export function ListingsProvider({ api, children }: { api: SiteData["api"]; children: ReactNode }) {
  const [listings, setListings] = useState<Listings>({ status: "loading" });

  useEffect(() => {
    let current = true;
    searchHouses(api, { page_size: SUMMARY_SIZE })
      .then((result) => {
        if (current) setListings({ status: "ready", count: result.count, houses: result.results });
      })
      .catch(() => {
        if (current) setListings({ status: "failed" });
      });
    return () => {
      current = false;
    };
  }, [api]);

  return <ListingsContext.Provider value={listings}>{children}</ListingsContext.Provider>;
}

export function useListings(): Listings {
  return useContext(ListingsContext);
}
