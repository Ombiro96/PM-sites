import type { PictureRef, SiteData } from "./types";

export type ResolvedPicture = {
  url: string;
  width: number;
  height: number;
  alt: string;
  position: string;
};

export function resolvePicture(
  ref: PictureRef | undefined,
  site: SiteData,
): ResolvedPicture | null {
  if (!ref) return null;
  const picture = site.pictures[ref.asset];
  if (!picture) return null;

  const [x, y] = ref.focus ?? [0.5, 0.5];
  return {
    ...picture,
    alt: ref.alt ?? "",
    position: `${x * 100}% ${y * 100}%`,
  };
}
