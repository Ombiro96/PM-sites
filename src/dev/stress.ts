import type { SiteData } from "@/lib/site/types";
import block from "./pictures/b2.jpg";
import skyline from "./pictures/c1.jpg";
import keys from "./pictures/i4.jpg";
import office from "./pictures/k1.jpg";
import { temboHart } from "./tembo-hart";
import { STANDARD_SERVICES } from "./wording";

/**
 * The site behind `/__sections`: a very long company name, every fact filled
 * in, and a document with all four pages so every button has somewhere to go.
 * `as_missing` is deliberately absent from the pictures.
 */
export const stressSite: SiteData = {
  ...temboHart,
  site: { ...temboHart.site, id: "sample-stress", address: "stress-test" },
  facts: {
    ...temboHart.facts,
    name: "Wanjiru, Otieno & Kiplagat Property Management and Letting Agents (East Africa) Limited",
    email:
      "a-very-long-mailbox-name-for-owners-and-tenants@wanjiru-otieno-kiplagat-properties.example",
    office_address:
      "Suite 14B, 4th floor, Prestige Plaza Annex, off Ngong Road near the Junction roundabout, Nairobi",
    opening_hours:
      "Monday to Friday 8am to 5pm, Saturday 9am to 1pm, closed on Sundays and public holidays",
    areas_served: [
      "Kilimani",
      "Kileleshwa",
      "Roysambu",
      "Kahawa Wendani",
      "Githurai 44",
      "Ruaka",
      "Syokimau",
      "Athi River",
    ],
    social_links: {
      facebook: "https://facebook.com/example",
      instagram: "https://instagram.com/example",
      tiktok: "https://tiktok.com/@example",
      x: "https://x.com/example",
      linkedin: "https://linkedin.com/company/example",
      youtube: "https://youtube.com/@example",
    },
  },
  figures: { buildings: 148, units: 12480, towns: 12 },
  pictures: {
    as_skyline: { small: skyline, large: skyline },
    as_block: { small: block, large: block },
    as_office: { small: office, large: office },
    as_keys: { small: keys, large: keys },
  },
  wording: { services: STANDARD_SERVICES },
};
