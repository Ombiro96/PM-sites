import type { Look } from "./types";

/** What a look changes beyond its CSS tokens (see `.look-*` in globals.css). */
export const LOOKS: Record<Look, { photoPageTitle: boolean }> = {
  fresh: { photoPageTitle: false },
  classic: { photoPageTitle: true },
  bold: { photoPageTitle: false },
  coast: { photoPageTitle: true },
  estate: { photoPageTitle: true },
  plain: { photoPageTitle: false },
};
