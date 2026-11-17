/**
 * The shapes the backend stores for a manager's website. Field names follow the
 * backend (`backend/websites/section_rules.py`, `docs/pm-websites-contract.md`)
 * so a stored document can be passed straight through.
 */

export type Look = "fresh" | "classic" | "bold" | "coast" | "estate" | "plain";
export type PageKind = "home" | "owners" | "about" | "contact";
export type Background = "white" | "tinted" | "brand";

export type Action =
  | { kind: "houses" }
  | { kind: "page"; page: string }
  | { kind: "section"; page: string; section: string }
  | { kind: "whatsapp"; message?: string }
  | { kind: "call" }
  | { kind: "tenant_login" };

export type ButtonField = { label: string; to: Action };

export type PictureRef = {
  asset: string;
  alt?: string;
  focus?: [number, number];
};

type SectionBase<Type extends string, Fields, Layout extends string = never> = {
  id: string;
  type: Type;
  layout?: Layout;
  background?: Background;
  hidden?: boolean;
  fields: Fields;
};

type WithItems<Item> = { items?: (Item & { id: string })[] };

export type PageTitleSection = SectionBase<
  "page_title",
  { heading?: string; text?: string; picture?: PictureRef }
>;

export type TopBannerSection = SectionBase<
  "top_banner",
  {
    heading?: string;
    text?: string;
    primary?: ButtonField;
    secondary?: ButtonField;
    pictures?: PictureRef[];
    badge?: "houses_available";
  },
  "split" | "photo" | "centre" | "band" | "plain"
>;

export type HousesSection = SectionBase<
  "houses",
  { heading?: string; show?: 3 | 6 },
  "cards" | "list" | "rows"
>;

export type AboutSection = SectionBase<
  "about",
  { heading?: string; text?: string; picture?: PictureRef },
  "picture_left" | "picture_right"
>;

export type StandardService =
  | "tenant_finding"
  | "rent_collection"
  | "repairs"
  | "owner_statements"
  | "caretaker"
  | "inspections"
  | "lease_paperwork"
  | "utilities_billing";

export type ServicesSection = SectionBase<
  "services",
  { heading?: string },
  "cards" | "list"
> &
  WithItems<{ service?: StandardService; title?: string; text?: string }>;

export type StepsSection = SectionBase<"steps", { heading?: string }> &
  WithItems<{ title?: string; text?: string }>;

export type Figure = "buildings" | "units" | "towns" | "houses_to_let";

export type FiguresSection = SectionBase<
  "figures",
  { heading?: string; show?: Figure[] }
>;

export type BuildingsSection = SectionBase<
  "buildings",
  { heading?: string; show?: 3 | 6 }
>;

export type TeamSection = SectionBase<"team", { heading?: string }> &
  WithItems<{ name?: string; role?: string; picture?: PictureRef }>;

export type TestimonialsSection = SectionBase<
  "testimonials",
  { heading?: string },
  "single" | "cards"
> &
  WithItems<{ quote?: string; by?: string; permission?: boolean }>;

export type AreasSection = SectionBase<"areas", { heading?: string }>;

export type QuestionsSection = SectionBase<
  "questions",
  { heading?: string; for?: "tenants" | "owners" }
> &
  WithItems<{ question?: string; answer?: string }>;

export type FeesSection = SectionBase<
  "fees",
  { heading?: string; note?: string }
> &
  WithItems<{ label?: string; value?: string }>;

export type ManagementRequestSection = SectionBase<
  "management_request",
  { heading?: string; text?: string; mode?: "form" | "whatsapp" }
>;

export type MessageFormSection = SectionBase<
  "message_form",
  { heading?: string; text?: string }
>;

export type ContactSection = SectionBase<"contact", { heading?: string }>;

export type CallToActionSection = SectionBase<
  "call_to_action",
  {
    heading?: string;
    text?: string;
    button?: ButtonField;
    picture?: PictureRef;
  }
>;

export type Section =
  | PageTitleSection
  | TopBannerSection
  | HousesSection
  | AboutSection
  | ServicesSection
  | StepsSection
  | FiguresSection
  | BuildingsSection
  | TeamSection
  | TestimonialsSection
  | AreasSection
  | QuestionsSection
  | FeesSection
  | ManagementRequestSection
  | MessageFormSection
  | ContactSection
  | CallToActionSection;

export type Page = {
  id: string;
  kind: PageKind;
  title: string;
  nav_label?: string;
  search_description?: string;
  sections: Section[];
};

export type SiteDocument = {
  version: number;
  header: {
    show_tenant_login: boolean;
    contact_action: "auto" | "whatsapp" | "call";
  };
  footer: { show_social: boolean };
  pages: Page[];
};

export type SocialNetwork =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube";

/** The public company facts, written into the page when the site is published. */
export type CompanyFacts = {
  name: string;
  /** Empty when the manager has no logo: the name is shown as a wordmark. */
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  office_address: string;
  opening_hours: string;
  latitude: number | null;
  longitude: number | null;
  social_links: Partial<Record<SocialNetwork, string>>;
  areas_served: string[];
};

export type SitePicture = { small: string; large: string };

export type StoredFigures = { buildings: number; units: number; towns: number };

export type ServiceWording = { title: string; text: string };

/**
 * Everything the backend writes into a published page
 * (`<script id="site-data" type="application/json">`).
 */
export type SiteData = {
  version: 1;
  site: {
    id: string;
    address: string;
    look: Look;
    brand_colour: string;
    show_credit: boolean;
    preview: boolean;
  };
  facts: CompanyFacts;
  figures: StoredFigures;
  pictures: Record<string, SitePicture>;
  wording: { services: Partial<Record<string, ServiceWording>> };
  document: SiteDocument;
  api: { base: string; agency: string };
};
