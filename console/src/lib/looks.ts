import type { Look } from "@/lib/site/types";
import type { Audience } from "./website";

/** How each look is named and described to a manager choosing one. */
export const LOOK_DETAILS: Record<Look, { name: string; summary: string }> = {
  fresh: {
    name: "Fresh",
    summary: "Friendly and modern, with rounded corners.",
  },
  classic: {
    name: "Classic",
    summary: "Serif headings, square corners and a dark header.",
  },
  bold: {
    name: "Bold",
    summary: "Heavy headings, with your colour across the header.",
  },
  coast: {
    name: "Coast",
    summary: "Soft serif headings and rounded pictures.",
  },
  estate: {
    name: "Estate",
    summary: "A dark page with fine serif headings.",
  },
  plain: {
    name: "Plain",
    summary: "Simple and compact, with nothing extra.",
  },
};

export const AUDIENCE_DETAILS: Record<
  Audience,
  { name: string; summary: string }
> = {
  tenants: {
    name: "Tenants",
    summary: "People looking for a house to rent.",
  },
  landlords: {
    name: "Landlords",
    summary: "Owners looking for someone to manage their building.",
  },
  both: { name: "Both", summary: "Tenants and landlords alike." },
};
