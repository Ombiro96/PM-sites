import { STANDARD_SERVICES } from "@/dev/wording";

/** How the section library's names are worded to a manager. A name with no entry is shown tidied up. */
const FIELDS: Record<string, string> = {
  heading: "Heading",
  text: "Text",
  note: "Note",
  picture: "Picture",
  pictures: "Pictures",
  primary: "Main button",
  secondary: "Second button",
  button: "Button",
  badge: "Badge",
  show: "How many to show",
  "figures.show": "Figures to show",
  for: "Who the questions are for",
  mode: "How owners reach you",
  title: "Title",
  name: "Name",
  role: "Role",
  quote: "What they said",
  by: "Who said it",
  permission: "They agreed to be quoted",
  question: "Question",
  answer: "Answer",
  label: "What the fee is for",
  value: "Amount",
};

const OPTIONS: Record<string, string> = {
  white: "Same as the page",
  tinted: "Shaded",
  brand: "Your colour",
  split: "Text beside a picture",
  photo: "Text over a picture",
  centre: "Centred text",
  band: "Text above a strip of pictures",
  plain: "Text only",
  cards: "Cards",
  list: "List",
  rows: "Rows",
  picture_left: "Picture on the left",
  picture_right: "Picture on the right",
  single: "One large quote",
  houses_available: "How many houses are to let",
  buildings: "Buildings",
  units: "Units",
  towns: "Towns",
  houses_to_let: "Houses to let",
  tenants: "Tenants",
  owners: "Owners",
  form: "A form on the page",
  whatsapp: "WhatsApp",
  houses: "The houses to let page",
  page: "Another page",
  section: "A section of a page",
  call: "Call you",
  tenant_login: "The tenant login",
};

const tidy = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).replaceAll("_", " ");

export function fieldLabel(sectionType: string, name: string): string {
  return FIELDS[`${sectionType}.${name}`] ?? FIELDS[name] ?? tidy(name);
}

export function optionLabel(option: string | number): string {
  if (typeof option === "number") return String(option);
  return OPTIONS[option] ?? STANDARD_SERVICES[option]?.title ?? tidy(option);
}

export const WHO_LABELS: Record<string, string> = {
  looking_for_house: "Looking for a house",
  tenant: "A tenant of yours",
  owner: "An owner looking for a manager",
  other: "Someone else",
};
