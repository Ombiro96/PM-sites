import { ImageResponse } from "next/og";
import { resolveBrand } from "@/lib/brand/resolve";
import { brandMonogram } from "@/lib/brand/monogram";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The tab icon is generated from brand tokens rather than shipped as a file, so
 * a new client gets a correct favicon with no artwork — the same reasoning as
 * the wordmark fallback in `components/layout/Logo.tsx`. Drop a real mark in
 * later by replacing this route with the client's asset.
 */
export default async function Icon() {
  const brand = await resolveBrand();
  const initials = brandMonogram(brand);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.theme.primary,
          color: brand.theme.primaryContrast,
          fontSize: initials.length > 2 ? 11 : initials.length > 1 ? 15 : 20,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          borderRadius: 6,
        }}
      >
        {initials}
      </div>
    ),
    size,
  );
}
