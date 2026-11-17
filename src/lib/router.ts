import type { PageKind } from "@/lib/site/types";

export type Route =
  | { name: "page"; kind: PageKind }
  | { name: "houses" }
  | { name: "house"; id: string }
  | { name: "sections" }
  | { name: "not_found" };

const STORED: Record<string, PageKind> = {
  "": "home",
  "for-owners": "owners",
  about: "about",
  contact: "contact",
};

/** Which page a path is. Trailing slashes and `index.html` are ignored. */
export function matchRoute(pathname: string): Route {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.at(-1) === "index.html") parts.pop();

  if (parts.length <= 1 && Object.hasOwn(STORED, parts[0] ?? "")) {
    return { name: "page", kind: STORED[parts[0] ?? ""] };
  }
  if (parts[0] === "houses") {
    if (parts.length === 1) return { name: "houses" };
    if (parts.length === 2 && /^[A-Za-z0-9-]{1,64}$/.test(parts[1])) {
      return { name: "house", id: parts[1].toLowerCase() };
    }
  }
  if (import.meta.env.DEV && parts.length === 1 && parts[0] === "__sections")
    return { name: "sections" };
  return { name: "not_found" };
}

/**
 * Whether a click on a link should be handled in the page instead of loading
 * a new one: a plain left click on a same-site address that is not a file.
 */
export function inSiteTarget(
  anchor: { href: string; target: string; hasAttribute(name: string): boolean },
  event: {
    button: number;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    defaultPrevented: boolean;
  },
  origin: string,
): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const last = url.pathname.split("/").pop() ?? "";
  if (last.includes(".") && last !== "index.html") return null;
  return url;
}

export type Location = { pathname: string; search: string; hash: string };
type Listener = () => void;
type NavigateOptions = { replace?: boolean; keepScroll?: boolean };

/** Query keys the dev server uses to pick a sample; carried from page to page. */
const DEV_KEYS = ["sample", "look", "listings", "colour", "only"];

let scrollIntent: "top" | "keep" | "restore" = "restore";
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** A stable string for the current address, for `useSyncExternalStore`. */
export function locationKey(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function takeScrollIntent(): "top" | "keep" | "restore" {
  const intent = scrollIntent;
  scrollIntent = "restore";
  return intent;
}

export function navigate(
  to: string | URL,
  options: NavigateOptions = {},
): void {
  const url = new URL(to, window.location.href);
  if (import.meta.env.DEV) {
    const current = new URLSearchParams(window.location.search);
    for (const key of DEV_KEYS) {
      const value = current.get(key);
      if (value !== null && !url.searchParams.has(key))
        url.searchParams.set(key, value);
    }
  }
  const target = `${url.pathname}${url.search}${url.hash}`;
  scrollIntent = options.keepScroll ? "keep" : "top";
  if (options.replace || target === locationKey()) {
    window.history.replaceState(null, "", target);
  } else {
    window.history.pushState(null, "", target);
  }
  emit();
}

/** Starts handling link clicks and the back button. Returns a function that stops it. */
export function startRouter(): () => void {
  const onClick = (event: MouseEvent) => {
    const anchor = (event.target as Element | null)?.closest?.("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const url = inSiteTarget(anchor, event, window.location.origin);
    if (!url) return;
    // A jump within the page that is already showing is left to the browser.
    const samePage =
      url.pathname === window.location.pathname &&
      url.search === window.location.search;
    if (samePage && url.hash) return;
    event.preventDefault();
    navigate(url);
  };
  const onPop = () => {
    scrollIntent = "restore";
    emit();
  };
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPop);
  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("popstate", onPop);
  };
}
