import { ImageResponse } from "next/og";
import { resolveBrand } from "@/lib/brand/resolve";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS, generated from the same brand tokens as the tab icon. */
export default async function AppleIcon() {
  const brand = await resolveBrand();
  const initials = brand.company.shortName.slice(0, 2).toUpperCase();

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
          fontSize: initials.length > 1 ? 84 : 112,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        {initials}
      </div>
    ),
    size,
  );
}
