import { ImageResponse } from "next/og";
import { monogram } from "@/lib/site/monogram";
import { getSite } from "@/lib/site/source";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The tab icon is drawn from the brand colour and the company's initials, so a
 * site has a correct favicon with no artwork.
 */
export default async function Icon() {
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
