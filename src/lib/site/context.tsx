import { createContext, useContext } from "react";
import { useListings } from "@/lib/listings/context";
import {
  resolveAction,
  resolveButton,
  type ActionContext,
  type ResolvedButton,
} from "./actions";
import type { PageKind, SiteData } from "./types";

export const SiteContext = createContext<SiteData | null>(null);

export function useSite(): SiteData {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite must be used inside a site");
  return site;
}

/** Which stored page is being drawn; forms report it with what they send. */
export const PageKindContext = createContext<PageKind>("home");

export function useActionContext(): ActionContext {
  const { document, facts } = useSite();
  const listings = useListings();
  return {
    document,
    facts,
    noHouses: listings.status === "ready" && listings.count === 0,
  };
}

export { resolveAction, resolveButton };
export type { ResolvedButton };
