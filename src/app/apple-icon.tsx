import { ImageResponse } from "next/og";
import { monogram } from "@/lib/site/monogram";
import { getSite } from "@/lib/site/source";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS, drawn the same way as the tab icon. */
export default async function AppleIcon() {
  const site = await getSite();
  const initials = monogram(site.facts.display_name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: site.brand_colour,
          color: "#ffffff",
          fontSize: initials.length > 2 ? 62 : initials.length > 1 ? 84 : 112,
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
