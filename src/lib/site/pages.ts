import type { Look, Page, PageKind, SiteDocument } from "./types";

export const PAGE_PATHS: Record<PageKind, string> = {
  home: "/",
  owners: "/for-owners",
  services: "/services",
  areas: "/areas",
  about: "/about",
  contact: "/contact",
};

export const HOUSES_PATH = "/houses";
export const TENANT_LOGIN_URL = "https://app.bomahut.com/t/login";

export const DEFAULT_NAV_LABELS: Record<PageKind, string> = {
  home: "Home",
  owners: "For owners",
  services: "Services",
  areas: "Areas we cover",
  about: "About",
  contact: "Contact",
};

/** What a look calls the houses it lets. */
export type HouseWords = {
  nav: string;
  title: string;
  one: string;
  many: string;
  view: string;
};

export function houseWords(look: Look): HouseWords {
  if (look === "estate") {
    return {
      nav: "Residences",
      title: "Residences to let",
      one: "residence",
      many: "residences",
      view: "View residence",
    };
  }
  if (look === "coast") {
    return {
      nav: "Homes to let",
      title: "Homes to let",
      one: "home",
      many: "homes",
      view: "View home",
    };
  }
  return {
    nav: "Houses to let",
    title: "Houses to let",
    one: "house",
    many: "houses",
    view: "View house",
  };
}

export type NavItem = { href: string; label: string };

export function findPage(
  document: SiteDocument,
  kind: PageKind,
): Page | undefined {
  return document.pages.find((page) => page.kind === kind);
}

export function navLabel(page: Page): string {
  return page.nav_label || DEFAULT_NAV_LABELS[page.kind] || page.title;
}

/** The menu, in its fixed order: Home, Houses to let, For owners, Services, Areas we cover, About, Contact. */
export function navItems(document: SiteDocument, look: Look): NavItem[] {
  const stored = (kind: PageKind): NavItem[] => {
    const page = findPage(document, kind);
    return page ? [{ href: PAGE_PATHS[kind], label: navLabel(page) }] : [];
  };

  return [
    ...stored("home"),
    { href: HOUSES_PATH, label: houseWords(look).nav },
    ...stored("owners"),
    ...stored("services"),
    ...stored("areas"),
    ...stored("about"),
    ...stored("contact"),
  ];
}
