export type ThemeTokens = {
  /** Brand primary, used for CTAs, links and accents. Any valid CSS colour. */
  primary: string;
  primaryContrast: string;
  /** Deeper shade of primary, used for hovers and dark surfaces. */
  primaryDeep: string;
  /** Secondary/accent colour, used sparingly for highlights and badges. */
  accent: string;
  accentContrast: string;
  /** Body text colour. */
  ink: string;
  inkMuted: string;
  /** Page and card backgrounds. */
  surface: string;
  surfaceMuted: string;
  border: string;
  /** Corner style for cards, buttons and inputs. */
  radius: "sharp" | "soft" | "round";
  /** Display font stack for headings. */
  fontDisplay: string;
  fontBody: string;
};

export type BrandLogos = {
  /** Shown on light backgrounds. `null` falls back to a typographic wordmark. */
  light: string | null;
  /** Shown on dark backgrounds (footer, transparent hero header). */
  dark: string | null;
  /** Square mark for favicons and compact spaces. */
  mark: string | null;
  /** Letters drawn in the generated tab, home-screen and wordmark marks.
   *  `null` falls back to the first two letters of the short name. */
  monogram: string | null;
  /** Width/height ratio of the wordmark, used to reserve layout space. */
  aspectRatio: number;
};

export type BrandContact = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string | null;
  email: string;
  addressLines: string[];
  city: string;
  officeHours: string;
  mapEmbedUrl: string | null;
};

export type BrandSocial = {
  facebook?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
};

export type NavItem = { label: string; href: string };

export type StatItem = { value: string; label: string };

export type ValueProp = { title: string; body: string; icon: IconName };

export type ServiceItem = {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
  icon: IconName;
};

export type AreaItem = {
  slug: string;
  name: string;
  blurb: string;
  image: string | null;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export type FaqItem = { question: string; answer: string };

export type IconName =
  | "building"
  | "key"
  | "wrench"
  | "shield"
  | "chart"
  | "clock"
  | "handshake"
  | "phone"
  | "document"
  | "sparkle"
  | "pin"
  | "users";

export type BrandContent = {
  hero: {
    eyebrow: string | null;
    heading: string;
    subheading: string;
    image: string;
    imageAlt: string;
    primaryCta: NavItem;
    secondaryCta: NavItem | null;
  };
  stats: StatItem[];
  valueProps: { heading: string; subheading: string; items: ValueProp[] };
  services: { heading: string; subheading: string; items: ServiceItem[] };
  areas: { heading: string; subheading: string; items: AreaItem[] };
  testimonials: Testimonial[];
  about: {
    heading: string;
    lead: string;
    body: string[];
    image: string | null;
    imageAlt: string;
  };
  faqs: FaqItem[];
  cta: { heading: string; body: string; primary: NavItem; secondary: NavItem | null };
};

export type Brand = {
  /** Stable identifier. Also the folder name under src/clients. */
  slug: string;
  /** Hostnames that resolve to this brand. First entry is canonical. */
  hosts: string[];
  company: {
    name: string;
    shortName: string;
    legalName: string;
    tagline: string;
    foundedYear: number | null;
  };
  logos: BrandLogos;
  theme: ThemeTokens;
  contact: BrandContact;
  social: BrandSocial;
  nav: NavItem[];
  footerLinks: { heading: string; items: NavItem[] }[];
  /** Bomahut CustomerAccount number this site reads its vacancies from. */
  accountNumber: string;
  /** Where existing tenants sign in. */
  tenantPortalUrl: string;
  /** Make.com (or other) webhook that receives enquiries. Falls back to env. */
  enquiryWebhookUrl: string | null;
  /** Webhook for tenant requests. Falls back to env, then to the enquiry one. */
  requestWebhookUrl: string | null;
  seo: {
    titleDefault: string;
    titleTemplate: string;
    description: string;
    keywords: string[];
    ogImage: string;
    locale: string;
  };
  content: BrandContent;
};
