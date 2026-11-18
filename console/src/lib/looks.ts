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
  midnight: {
    name: "Midnight",
    summary: "A near-black page with fine lines and tight headings.",
  },
  studio: {
    name: "Studio",
    summary: "Clean white and grey, with large tight headings.",
  },
  parchment: {
    name: "Parchment",
    summary: "Warm cream paper with light serif headings.",
  },
  lab: {
    name: "Lab",
    summary: "Lots of white space, light headings and round buttons.",
  },
  moss: {
    name: "Moss",
    summary: "A deep green page with heavy headings.",
  },
  dusk: {
    name: "Dusk",
    summary: "A dark navy page with light, airy headings.",
  },
  gallery: {
    name: "Gallery",
    summary: "Putty-coloured paper with very large serif headings.",
  },
  catalogue: {
    name: "Catalogue",
    summary: "Square, ruled and capitalised, like a parts catalogue.",
  },
  neon: {
    name: "Neon",
    summary: "A dark page where your colour glows.",
  },
  collage: {
    name: "Collage",
    summary: "Playful cards with thick outlines, like a scrapbook.",
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
