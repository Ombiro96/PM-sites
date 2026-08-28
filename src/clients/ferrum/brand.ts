import type { Brand } from "@/lib/brand/types";

/**
 * Client #1 — the reference implementation. Everything a second client needs is
 * in this file plus `listings.ts`; no component should ever reference "ferrum".
 *
 * TODO(ferrum): confirm company details, phone, address and portfolio numbers
 * with the client before launch. Photography is placeholder until their shoot.
 */
export const ferrumBrand: Brand = {
  slug: "ferrum",
  hosts: ["ferrumservices.co.ke", "www.ferrumservices.co.ke", "ferrum.localhost"],
  company: {
    name: "Ferrum Services",
    shortName: "Ferrum",
    legalName: "Ferrum Services Limited",
    tagline: "Property management, done properly.",
    foundedYear: null,
  },
  logos: {
    // TODO(ferrum): drop the real SVGs into public/clients/ferrum/ and point
    // these at them. Until then the site renders a typographic wordmark.
    light: null,
    dark: null,
    mark: null,
    aspectRatio: 4.4,
  },
  theme: {
    primary: "#16324F",
    primaryContrast: "#FFFFFF",
    primaryDeep: "#0E2237",
    accent: "#C08A2E",
    accentContrast: "#1A1206",
    ink: "#15202B",
    inkMuted: "#5A6875",
    surface: "#FFFFFF",
    surfaceMuted: "#F5F6F8",
    border: "#E3E7EC",
    radius: "soft",
    // Loaded in the root layout; the stack degrades gracefully if a font fails.
    fontDisplay: 'var(--font-fraunces), ui-serif, Georgia, serif',
    fontBody: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  },
  contact: {
    phone: "+254700000000",
    phoneDisplay: "0700 000 000",
    whatsapp: "+254700000000",
    email: "info@ferrumservices.co.ke",
    addressLines: ["Ferrum House, Ground Floor", "Ngong Road"],
    city: "Nairobi",
    officeHours: "Monday - Friday, 8:00am - 5:00pm",
    mapEmbedUrl: null,
  },
  social: {},
  nav: [
    { label: "Properties", href: "/properties" },
    { label: "Areas", href: "/areas" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerLinks: [
    {
      heading: "Find a home",
      items: [
        { label: "All properties", href: "/properties" },
        { label: "Apartments", href: "/properties?category=apartment" },
        { label: "Bedsitters", href: "/properties?category=bedsitter" },
        { label: "Areas we serve", href: "/areas" },
      ],
    },
    {
      heading: "For landlords",
      items: [
        { label: "Our services", href: "/services" },
        { label: "List your property", href: "/contact?subject=landlord" },
        { label: "About us", href: "/about" },
      ],
    },
    {
      heading: "Tenants",
      items: [
        { label: "Tenant login", href: "/tenant-portal" },
        { label: "Report maintenance", href: "/tenant-portal" },
        { label: "Contact us", href: "/contact" },
      ],
    },
  ],
  accountNumber: "TODO_FERRUM_ACCOUNT_NUMBER",
  tenantPortalUrl: "https://app.bomahut.com/t/login",
  enquiryWebhookUrl: null,
  seo: {
    titleDefault: "Ferrum Services - Property Management in Nairobi",
    titleTemplate: "%s | Ferrum Services",
    description:
      "Ferrum Services manages residential property in Nairobi. Browse available houses and apartments to rent, or hand us the running of yours.",
    keywords: [
      "property management Nairobi",
      "houses to rent Nairobi",
      "apartments to rent Nairobi",
      "property managers in Kenya",
      "letting agents Nairobi",
    ],
    ogImage: "/clients/ferrum/og.jpg",
    locale: "en_KE",
  },
  content: {
    hero: {
      eyebrow: "Nairobi property management",
      heading: "Find a home you will actually want to come back to.",
      subheading:
        "We manage residential property across Nairobi - well-kept buildings, honest rents and a landlord relationship that lasts.",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80",
      imageAlt: "Modern residential apartments at dusk",
      primaryCta: { label: "View available homes", href: "/properties" },
      secondaryCta: { label: "Talk to us", href: "/contact" },
    },
    stats: [
      { value: "500+", label: "Units under management" },
      { value: "12", label: "Nairobi neighbourhoods" },
      { value: "24hr", label: "Maintenance response" },
      { value: "98%", label: "Rent collection rate" },
    ],
    valueProps: {
      heading: "Why tenants and landlords stay with us",
      subheading: "Property management is a service business. We treat it like one.",
      items: [
        {
          title: "Buildings that are looked after",
          body: "Common areas cleaned, water running, lifts serviced. The unglamorous work that decides whether a building is worth living in.",
          icon: "building",
        },
        {
          title: "Maintenance handled fast",
          body: "Report an issue from your phone and track it to completion. No group chats, no chasing the caretaker.",
          icon: "wrench",
        },
        {
          title: "Transparent statements",
          body: "Landlords see every shilling collected, spent and disbursed - monthly, in writing, on time.",
          icon: "chart",
        },
        {
          title: "Tenants who stay",
          body: "Careful vetting and fair treatment mean lower turnover, fewer void months and better returns.",
          icon: "users",
        },
      ],
    },
    services: {
      heading: "What we do",
      subheading: "Full-service management for landlords, and a straight deal for tenants.",
      items: [
        {
          slug: "property-management",
          title: "Property management",
          summary: "We run the building day to day so you do not have to think about it.",
          bullets: [
            "Rent invoicing, collection and follow-up",
            "Monthly landlord statements and disbursement",
            "Service charge and utility administration",
            "Caretaker supervision and site visits",
          ],
          icon: "building",
        },
        {
          slug: "letting-and-tenant-placement",
          title: "Letting & tenant placement",
          summary: "Marketing, viewings, vetting and a signed lease.",
          bullets: [
            "Listing your vacancy across our channels",
            "Accompanied viewings",
            "Tenant vetting and reference checks",
            "Lease preparation and signing",
          ],
          icon: "key",
        },
        {
          slug: "maintenance-and-repairs",
          title: "Maintenance & repairs",
          summary: "A vetted trade network and a documented trail for every job.",
          bullets: [
            "Tenant-reported issues logged and tracked",
            "Vetted plumbers, electricians and fundis",
            "Quotes approved before work starts",
            "Preventive maintenance schedules",
          ],
          icon: "wrench",
        },
        {
          slug: "landlord-reporting",
          title: "Reporting & compliance",
          summary: "Know exactly how your property is performing.",
          bullets: [
            "Monthly income and expense statements",
            "Arrears and occupancy reporting",
            "Deposit handling and reconciliation",
            "Lease renewals and notice management",
          ],
          icon: "document",
        },
      ],
    },
    areas: {
      heading: "Where we manage property",
      subheading:
        "Local knowledge matters. These are the Nairobi neighbourhoods we know best.",
      items: [
        {
          slug: "kilimani",
          name: "Kilimani",
          blurb:
            "Apartment living close to town, with schools, hospitals and the Yaya/Adams corridor on your doorstep.",
          image:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        },
        {
          slug: "westlands",
          name: "Westlands",
          blurb:
            "Nairobi's commercial second centre - short commutes, strong rental demand and plenty to walk to.",
          image:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        },
        {
          slug: "south-b",
          name: "South B",
          blurb:
            "Established, well-serviced and consistently good value for families who want space near the CBD.",
          image:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
        },
        {
          slug: "ruaka",
          name: "Ruaka",
          blurb:
            "Fast-growing, well-priced apartments with easy access to Limuru Road and the Northern Bypass.",
          image:
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        },
      ],
    },
    testimonials: [
      {
        quote:
          "Reporting a leak used to mean three phone calls and a week of waiting. Now I log it and someone shows up.",
        author: "Wanjiru M.",
        role: "Tenant, Kilimani",
      },
      {
        quote:
          "My statement arrives on the same date every month and the numbers match my bank. That is all I ever wanted.",
        author: "Peter O.",
        role: "Landlord, Westlands",
      },
    ],
    about: {
      heading: "About Ferrum Services",
      lead: "We manage residential property in Nairobi for landlords who want the job done without being managed themselves.",
      body: [
        "Ferrum Services was built on a simple observation: most property in Nairobi is not badly built, it is badly run. Buildings fall behind because nobody owns the small decisions - the broken gate, the unpaid water bill, the tenant who has quietly been three months late.",
        "We take those decisions off a landlord's desk. Rent is invoiced and followed up. Maintenance is logged, quoted and closed out. Statements arrive monthly, and they reconcile.",
        "For tenants, that shows up as something plainer: a building that works, and someone who answers.",
      ],
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
      imageAlt: "Property management team at work",
    },
    faqs: [
      {
        question: "How do I book a viewing?",
        answer:
          "Send an enquiry from any listing page, or call us during office hours. We will confirm a viewing slot, usually within two working days.",
      },
      {
        question: "What do I need to move in?",
        answer:
          "A copy of your ID, your most recent payslip or business records, and a contactable referee. Deposit and first month's rent are payable before keys are handed over.",
      },
      {
        question: "How is rent paid?",
        answer:
          "Rent is paid to the property's dedicated M-PESA paybill using your tenant account number. You receive an invoice before the due date and a receipt after payment.",
      },
      {
        question: "How do I report a maintenance issue?",
        answer:
          "Existing tenants report maintenance from the tenant portal. Every request is logged with a status you can follow.",
      },
      {
        question: "I am a landlord. What does management cost?",
        answer:
          "Management fees are a percentage of rent collected and depend on the size and type of the property. Get in touch and we will quote after a site visit.",
      },
    ],
    cta: {
      heading: "Looking for a home, or for someone to run yours?",
      body: "Tell us what you need. We reply during office hours, usually the same day.",
      primary: { label: "Send an enquiry", href: "/contact" },
      secondary: { label: "Browse available homes", href: "/properties" },
    },
  },
};
