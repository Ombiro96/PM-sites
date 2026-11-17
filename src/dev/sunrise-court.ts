import type { SiteData } from "@/lib/site/types";
import { STANDARD_SERVICES } from "./wording";

/**
 * The thin sample from the contract (section 11B): one building, name and phone
 * only. The document is `thin_site()` in
 * `backend/websites/tests/sample_documents.py`; every name here is made up.
 */
export const sunriseCourt: SiteData = {
  version: 1,
  site: {
    id: "sample-sunrise-court",
    address: "sunrise-court",
    look: "plain",
    brand_colour: "#1d4e89",
    show_credit: true,
    preview: false,
  },
  facts: {
    name: "Sunrise Court",
    logo: "",
    phone: "0700 000 303",
    whatsapp: "",
    email: "",
    office_address: "",
    opening_hours: "",
    latitude: null,
    longitude: null,
    social_links: {},
    areas_served: [],
  },
  figures: { buildings: 1, units: 30, towns: 1 },
  pictures: {},
  wording: { services: STANDARD_SERVICES },
  api: { base: "", agency: "sunrise-court" },
  document: {
    version: 1,
    header: { show_tenant_login: true, contact_action: "auto" },
    footer: { show_social: true },
    pages: [
      {
        id: "pg_home",
        kind: "home",
        title: "Home",
        sections: [
          {
            id: "sec_banner",
            type: "top_banner",
            layout: "plain",
            fields: {
              heading: "Houses to let in Kondele",
              primary: { label: "See houses to let", to: { kind: "houses" } },
            },
          },
          {
            id: "sec_houses",
            type: "houses",
            layout: "list",
            fields: { heading: "Houses to let" },
          },
          {
            id: "sec_home_contact",
            type: "contact",
            fields: { heading: "Contact us" },
          },
        ],
      },
      {
        id: "pg_contact",
        kind: "contact",
        title: "Contact",
        sections: [
          {
            id: "sec_contact_title",
            type: "page_title",
            fields: { heading: "Contact us" },
          },
          {
            id: "sec_contact",
            type: "contact",
            fields: { heading: "Contact us" },
          },
          {
            id: "sec_message",
            type: "message_form",
            fields: { heading: "Send us a message" },
          },
        ],
      },
    ],
  },
};
