import { describe, expect, it } from "vitest";
import { resolveAction, resolveButton, headerContactButton, type ActionContext } from "./actions";
import { brandVariables } from "./brand";
import { parseSiteData, readInjectedData } from "./data";
import { resolvePicture } from "./pictures";
import type { SiteData } from "./types";

const RAW = {
  version: 1,
  site: { id: "pub_1", address: "tembo-hart", look: "classic", brand_colour: "#1d4e89", show_credit: true, preview: false },
  facts: {
    name: "Tembo & Hart",
    logo: "",
    phone: "0711 000 202",
    whatsapp: "0711 000 202",
    email: "",
    office_address: "",
    opening_hours: "",
    latitude: null,
    longitude: null,
    social_links: { facebook: "https://facebook.com/x" },
    areas_served: ["Kilimani"],
  },
  figures: { buildings: 3, units: 100, towns: 1 },
  pictures: { as_1: { small: "https://cdn.example/s.jpg", large: "https://cdn.example/l.jpg" } },
  wording: { services: { tenant_finding: { title: "Finding tenants", text: "…" } } },
  document: {
    version: 1,
    header: { show_tenant_login: true, contact_action: "auto" },
    footer: { show_social: true },
    pages: [
      { id: "pg_home", kind: "home", title: "Home", sections: [] },
      {
        id: "pg_owners",
        kind: "owners",
        title: "For owners",
        sections: [
          { id: "sec_request", type: "management_request", fields: { heading: "Ask us" } },
          { id: "sec_hidden", type: "fees", hidden: true, fields: { heading: "Fees" } },
        ],
      },
      { id: "pg_contact", kind: "contact", title: "Contact", sections: [] },
    ],
  },
  api: { base: "https://backend.example/api/", agency: "tembo-hart" },
};

const site = parseSiteData(RAW) as SiteData;
const context: ActionContext = { document: site.document, facts: site.facts };

describe("reading injected data", () => {
  function page(html: string): Document {
    return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  }

  it("reads the script tag the backend writes", () => {
    const doc = page(`<div hidden><script id="site-data" type="application/json">${JSON.stringify(RAW)}</script></div>`);
    const data = readInjectedData(doc);
    expect(data?.facts.name).toBe("Tembo & Hart");
    expect(data?.site.look).toBe("classic");
    expect(data?.api.base).toBe("https://backend.example/api");
  });

  it("returns null when the placeholder was never replaced or the data is broken", () => {
    expect(readInjectedData(page("<div hidden>%SITE_DATA%</div>"))).toBeNull();
    expect(readInjectedData(page('<script id="site-data" type="application/json">{not json</script>'))).toBeNull();
    expect(readInjectedData(page('<script id="site-data" type="application/json">{"version":2}</script>'))).toBeNull();
  });

  it("fills in what is optional and refuses an unknown look", () => {
    const data = parseSiteData({ version: 1, site: { look: "neon" }, facts: { latitude: "-1.3", longitude: "" }, document: { pages: [] } });
    expect(data?.site.look).toBe("plain");
    expect(data?.facts.latitude).toBe(-1.3);
    expect(data?.facts.longitude).toBeNull();
    expect(data?.facts.areas_served).toEqual([]);
    expect(data?.pictures).toEqual({});
    expect(data?.document.header.contact_action).toBe("auto");
  });
});

describe("button destinations", () => {
  it("houses goes to the houses page, or to contact when there is nothing to let", () => {
    expect(resolveAction({ kind: "houses" }, "See houses", context)?.href).toBe("/houses");
    expect(resolveAction({ kind: "houses" }, "See houses", { ...context, noHouses: true })?.href).toBe("/contact");
  });

  it("page and section go to the page's fixed path", () => {
    expect(resolveAction({ kind: "page", page: "pg_owners" }, "Owners", context)?.href).toBe("/for-owners");
    expect(resolveAction({ kind: "section", page: "pg_owners", section: "sec_request" }, "Ask", context)?.href).toBe(
      "/for-owners#sec_request",
    );
  });

  it("gives no button for a page or section that is missing or hidden", () => {
    expect(resolveAction({ kind: "page", page: "pg_gone" }, "Gone", context)).toBeNull();
    expect(resolveAction({ kind: "section", page: "pg_owners", section: "sec_hidden" }, "Fees", context)).toBeNull();
    expect(resolveButton(undefined, context)).toBeNull();
  });

  it("whatsapp opens a chat with the company number and the message", () => {
    const button = resolveAction({ kind: "whatsapp", message: "Hello there" }, "WhatsApp us", context);
    expect(button).toMatchObject({ href: "https://wa.me/254711000202?text=Hello%20there", external: true, kind: "whatsapp" });
  });

  it("whatsapp with no number becomes a call button", () => {
    const noWhatsapp = { ...context, facts: { ...site.facts, whatsapp: "" } };
    expect(resolveAction({ kind: "whatsapp" }, "WhatsApp us", noWhatsapp)).toMatchObject({
      label: "Call us",
      href: "tel:0711000202",
    });
    expect(headerContactButton(noWhatsapp)?.href).toBe("tel:0711000202");
  });

  it("call and tenant login", () => {
    expect(resolveAction({ kind: "call" }, "Call", context)?.href).toBe("tel:0711000202");
    expect(resolveAction({ kind: "tenant_login" }, "Log in", context)).toMatchObject({
      href: "https://app.bomahut.com/t/login",
      external: true,
    });
  });

  it("ignores a destination kind it does not know", () => {
    expect(resolveAction({ kind: "javascript" } as never, "x", context)).toBeNull();
  });
});

describe("picture lookup", () => {
  it("finds a stored picture and its focus", () => {
    expect(resolvePicture({ asset: "as_1", alt: "Office", focus: [0.25, 1] }, site.pictures)).toEqual({
      small: "https://cdn.example/s.jpg",
      large: "https://cdn.example/l.jpg",
      alt: "Office",
      position: "25% 100%",
    });
  });

  it("gives nothing for a missing asset, so the no-picture design is drawn", () => {
    expect(resolvePicture({ asset: "as_missing" }, site.pictures)).toBeNull();
    expect(resolvePicture(undefined, site.pictures)).toBeNull();
    expect(resolvePicture({ asset: "constructor" }, site.pictures)).toBeNull();
  });

  it("refuses an address that is not https", () => {
    const pictures = { bad: { small: "javascript:alert(1)", large: "data:text/html,x" } };
    expect(resolvePicture({ asset: "bad" }, pictures)).toBeNull();
  });
});

describe("brand colours", () => {
  it("picks readable text for a dark and a light brand colour", () => {
    expect(brandVariables("#1d4e89", "classic")["--on"]).toBe("#ffffff");
    expect(brandVariables("#f2d94e", "classic")["--on"]).toBe("#16120a");
  });

  it("keeps the brand readable as text on the dark estate page", () => {
    expect(brandVariables("#b89a5e", "estate")["--brand-ink"]).toBe("#b89a5e");
    expect(brandVariables("#10243d", "estate")["--brand-ink"]).not.toBe("#10243d");
  });
});
