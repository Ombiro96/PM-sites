import { safeUrl } from "@/lib/utils";
import type { PictureRef, SiteData } from "./types";

export type ResolvedPicture = {
  small: string;
  large: string;
  alt: string;
  position: string;
};

/**
 * Finds a stored picture. Null when the section names none, the asset is not
 * in the page's data, or its address is not one we will load: the caller then
 * draws its no-picture design, never a broken image.
 */
export function resolvePicture(
  ref: PictureRef | undefined | null,
  pictures: SiteData["pictures"],
): ResolvedPicture | null {
  if (!ref || typeof ref.asset !== "string") return null;
  const picture = Object.hasOwn(pictures, ref.asset) ? pictures[ref.asset] : null;
  if (!picture) return null;
  const large = safeUrl(picture.large) ?? safeUrl(picture.small);
  const small = safeUrl(picture.small) ?? large;
  if (!large || !small) return null;

  const [x, y] = Array.isArray(ref.focus) ? ref.focus : [0.5, 0.5];
  const clamp = (value: unknown) =>
    typeof value === "number" && value >= 0 && value <= 1 ? value : 0.5;
  return {
    small,
    large,
    alt: typeof ref.alt === "string" ? ref.alt : "",
    position: `${clamp(x) * 100}% ${clamp(y) * 100}%`,
  };
}
