import type { SiteData } from "@/lib/site/types";
import block from "./pictures/b2.jpg";
import skyline from "./pictures/c1.jpg";
import keys from "./pictures/i4.jpg";
import office from "./pictures/k1.jpg";
import { STANDARD_SERVICES } from "./wording";

/**
 * The full sample from the contract (section 11A): a management company that
 * wants landlords. The document is `full_site()` in
 * `backend/websites/tests/sample_documents.py`; every name here is made up.
 */
export const temboHart: SiteData = {
  version: 1,
  site: {
    id: "sample-tembo-hart",
    address: "tembo-hart",
    look: "classic",
    brand_colour: "#1f4d3a",
    show_credit: true,
    preview: false,
  },
  facts: {
    name: "Tembo & Hart",
    logo: "",
    phone: "0711 000 202",
    whatsapp: "0711 000 202",
    email: "owners@tembohart.example",
    office_address: "4th floor, Prestige Plaza, Ngong Road, Nairobi",
    opening_hours: "Mon to Fri, 8am to 5pm",
    latitude: -1.3001,
    longitude: 36.7873,
    social_links: {
      facebook: "https://facebook.com/tembohart.example",
      linkedin: "https://linkedin.com/company/tembohart-example",
    },
    areas_served: ["Kilimani", "Kileleshwa", "Roysambu"],
  },
  figures: { buildings: 3, units: 100, towns: 1 },
  pictures: {
    as_skyline: { small: skyline, large: skyline },
    as_block: { small: block, large: block },
    as_office: { small: office, large: office },
    as_keys: { small: keys, large: keys },
  },
  wording: { services: STANDARD_SERVICES },
  api: { base: "", agency: "tembo-hart" },
  document: {
    version: 1,
    header: { show_tenant_login: true, contact_action: "auto" },
    footer: { show_social: true },
    pages: [
      {
        id: "pg_home",
        kind: "home",
        title: "Home",
        nav_label: "Home",
        search_description:
          "Tembo & Hart lets and manages residential buildings in Nairobi.",
        sections: [
          {
            id: "sec_banner",
            type: "top_banner",
            layout: "photo",
            fields: {
              heading: "Your building, managed and reported on every month",
              text: "Tembo & Hart lets, collects and maintains residential buildings in Nairobi.",
              primary: {
                label: "Ask for a proposal",
                to: {
                  kind: "section",
                  page: "pg_owners",
                  section: "sec_request",
                },
              },
              secondary: { label: "See houses to let", to: { kind: "houses" } },
              pictures: [
                {
                  asset: "as_skyline",
                  alt: "Nairobi skyline at dusk",
                  focus: [0.5, 0.5],
                },
              ],
            },
          },
          {
            id: "sec_services",
            type: "services",
            layout: "cards",
            background: "white",
            fields: { heading: "What we do for owners" },
            items: [
              { id: "it_s1", service: "tenant_finding" },
              { id: "it_s2", service: "rent_collection" },
              { id: "it_s3", service: "repairs" },
              {
                id: "it_s4",
                title: "Owners abroad",
                text: "We handle everything while you are away.",
              },
            ],
          },
          {
            id: "sec_figures",
            type: "figures",
            background: "brand",
            fields: {
              heading: "What we manage today",
              show: ["buildings", "units", "towns"],
            },
          },
          {
            id: "sec_buildings",
            type: "buildings",
            background: "white",
            fields: { heading: "Buildings we manage", show: 3 },
          },
          {
            id: "sec_quote",
            type: "testimonials",
            layout: "single",
            background: "tinted",
            fields: { heading: "What our clients say" },
            items: [
              {
                id: "it_q1",
                quote: "I get my statement on the 5th without asking.",
                by: "Owner of a 32-unit building",
                permission: true,
              },
            ],
          },
          {
            id: "sec_home_contact",
            type: "contact",
            fields: { heading: "Contact us" },
          },
        ],
      },
      {
        id: "pg_owners",
        kind: "owners",
        title: "For owners",
        nav_label: "For owners",
        sections: [
          {
            id: "sec_owners_title",
            type: "page_title",
            fields: {
              heading: "Property management for owners",
              text: "We let, collect, maintain and report.",
              picture: {
                asset: "as_block",
                alt: "A block of flats",
                focus: [0.5, 0.5],
              },
            },
          },
          {
            id: "sec_steps",
            type: "steps",
            background: "tinted",
            fields: { heading: "How we work" },
            items: [
              {
                id: "it_p1",
                title: "We visit the building",
                text: "We see the units.",
              },
              {
                id: "it_p2",
                title: "We agree the terms",
                text: "You receive our proposal.",
              },
              {
                id: "it_p3",
                title: "We take over",
                text: "Tenants are told how to pay.",
              },
            ],
          },
          {
            id: "sec_fees",
            type: "fees",
            fields: { heading: "Our fees" },
            items: [
              {
                id: "it_f1",
                label: "Management",
                value: "8% of rent collected",
              },
              {
                id: "it_f2",
                label: "Letting a vacant unit",
                value: "Half of one month's rent",
              },
            ],
          },
          {
            id: "sec_owner_questions",
            type: "questions",
            background: "tinted",
            fields: { heading: "Questions owners ask", for: "owners" },
            items: [
              {
                id: "it_oq1",
                question: "When do I receive my money?",
                answer: "By the 6th of each month, with a statement.",
              },
            ],
          },
          {
            id: "sec_request",
            type: "management_request",
            background: "white",
            fields: {
              heading: "Ask us to manage your building",
              text: "Tell us a little about it and we will call you.",
              mode: "form",
            },
          },
        ],
      },
      {
        id: "pg_about",
        kind: "about",
        title: "About",
        nav_label: "About",
        sections: [
          {
            id: "sec_about_title",
            type: "page_title",
            fields: { heading: "About Tembo & Hart" },
          },
          {
            id: "sec_story",
            type: "about",
            layout: "picture_right",
            fields: {
              heading: "Two partners and a rule about the 5th",
              text: "Tembo & Hart was set up by two people who had each owned a building.\n\nEvery owner gets a clear statement on the 5th.",
              picture: {
                asset: "as_office",
                alt: "Our office",
                focus: [0.5, 0.5],
              },
            },
          },
          {
            id: "sec_team",
            type: "team",
            fields: { heading: "The team" },
            items: [
              { id: "it_t1", name: "Example Partner", role: "Partner, owners" },
            ],
          },
          {
            id: "sec_about_cta",
            type: "call_to_action",
            fields: {
              heading: "Looking for a house?",
              button: { label: "See houses to let", to: { kind: "houses" } },
              picture: { asset: "as_keys", alt: "", focus: [0.5, 0.5] },
            },
          },
        ],
      },
      {
        id: "pg_contact",
        kind: "contact",
        title: "Contact",
        nav_label: "Contact",
        sections: [
          {
            id: "sec_contact_title",
            type: "page_title",
            fields: { heading: "Contact us" },
          },
          {
            id: "sec_contact",
            type: "contact",
            fields: { heading: "Where to find us" },
          },
          {
            id: "sec_message",
            type: "message_form",
            background: "tinted",
            fields: { heading: "Send us a message" },
          },
        ],
      },
    ],
  },
};
