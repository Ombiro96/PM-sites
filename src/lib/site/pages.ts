import type { Page, PageKind, SiteDocument } from "./types";

export const PAGE_PATHS: Record<PageKind, string> = {
  home: "/",
  owners: "/for-owners",
  about: "/about",
  contact: "/contact",
};

export const HOUSES_PATH = "/houses";
export const TENANT_LOGIN_URL = "https://app.bomahut.com/t/login";

const DEFAULT_NAV_LABELS: Record<PageKind, string> = {
  home: "Home",
  owners: "For owners",
  about: "About",
  contact: "Contact",
};

export type NavItem = { href: string; label: string };

export function findPage(
  document: SiteDocument,
  kind: PageKind,
): Page | undefined {
  return document.pages.find((page) => page.kind === kind);
}

/** The menu, in its fixed order: Home, Houses to let, For owners, About, Contact. */
export function navItems(document: SiteDocument): NavItem[] {
  const stored = (kind: PageKind): NavItem[] => {
    const page = findPage(document, kind);
    if (!page) return [];
    return [
      {
        href: PAGE_PATHS[kind],
        label: page.nav_label || DEFAULT_NAV_LABELS[kind],
      },
    ];
  };

  return [
    ...stored("home"),
    { href: HOUSES_PATH, label: "Houses to let" },
    ...stored("owners"),
    ...stored("about"),
    ...stored("contact"),
  ];
}
