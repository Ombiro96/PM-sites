import type { Background, PageKind } from "@/lib/site/types";

/** The section library as the backend gives it (`rules_as_data` in `backend/websites/section_rules.py`). */
export type FieldKind =
  | "text"
  | "longtext"
  | "picture"
  | "pictures"
  | "button"
  | "choice"
  | "choices"
  | "flag";

export type FieldRule = {
  name: string;
  kind: FieldKind;
  required: boolean;
  min_length: number;
  max_length: number;
  max_paragraphs: number;
  options: (string | number)[];
  min_count: number;
  max_count: number;
};

export type ItemsRule = {
  label: string;
  min_count: number;
  max_count: number;
  fields: FieldRule[];
  standard_key: string;
  standard_options: string[];
};

export type SectionRule = {
  type: string;
  name: string;
  description: string;
  pages: PageKind[];
  source: "free" | "manager" | "live";
  fields: FieldRule[];
  items: ItemsRule | null;
  layouts: string[];
  backgrounds: Background[];
  always_brand: boolean;
  max_per_page: number;
  layout_picture_counts: [string, number[]][];
  layout_item_counts: [string, number, number][];
};

export type Rules = {
  max_sections_per_page: number;
  action_kinds: Record<string, string[]>;
  page: { opening_section: Record<PageKind, string> };
  button: {
    label_min: number;
    label_max: number;
    whatsapp_message_max: number;
  };
  picture: { alt_max: number };
  sections: SectionRule[];
};

export function ruleFor(rules: Rules, type: string): SectionRule | undefined {
  return rules.sections.find((rule) => rule.type === type);
}
