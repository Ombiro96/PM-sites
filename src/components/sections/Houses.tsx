import {
  CardSkeletons,
  BuildingCard,
  HouseCardView,
  HouseLargeRow,
  HouseListRow,
} from "@/components/listings/HouseViews";
import { ActionLink, SectionShell } from "@/components/ui";
import { useListings } from "@/lib/listings/context";
import { resolveAction, useActionContext, useSite } from "@/lib/site/context";
import { HOUSES_PATH, houseWords } from "@/lib/site/pages";
import type { BuildingsSection, HousesSection } from "@/lib/site/types";

export const UNAVAILABLE = "Availability is temporarily unavailable";

/**
 * The manager's houses to let, live. With none, the section is not drawn;
 * when the feed cannot be reached it says so and never claims there are none.
 */
export function Houses({ section }: { section: HousesSection }) {
  const listings = useListings();
  const context = useActionContext();
  const words = houseWords(useSite().site.look);
  const show = section.fields.show === 6 ? 6 : 3;

  if (listings.status === "loading") {
    return (
      <SectionShell section={section}>
        <span className="sr" role="status">
          Loading {words.many} to let
        </span>
        <CardSkeletons count={3} />
      </SectionShell>
    );
  }
  if (listings.status === "failed") {
    return (
      <SectionShell section={section}>
        <div className="notice" role="status">
          <b>{UNAVAILABLE}</b>
          <span className="meta">
            Please try again shortly, or contact us and we will tell you what is
            free.
          </span>
          <ActionLink
            button={resolveAction({ kind: "call" }, "Call us", context)}
            className="line sm"
          />
        </div>
      </SectionShell>
    );
  }
  if (listings.count === 0) return null;

  const houses = listings.houses.slice(0, show);
  const layout = section.layout ?? "cards";
  return (
    <SectionShell section={section}>
      {layout === "list" ? (
        <div className="hlist">
          {houses.map((house) => (
            <HouseListRow key={house.id} house={house} />
          ))}
        </div>
      ) : layout === "rows" ? (
        <div className="frows">
          {houses.map((house) => (
            <HouseLargeRow key={house.id} house={house} words={words} />
          ))}
        </div>
      ) : (
        <div className="grid3">
          {houses.map((house) => (
            <HouseCardView key={house.id} house={house} words={words} />
          ))}
        </div>
      )}
      {listings.count > houses.length ? (
        <div>
          <a className="btn line" href={HOUSES_PATH}>
            See all {listings.count} {words.many}
          </a>
        </div>
      ) : null}
    </SectionShell>
  );
}

/** Buildings with a public advert, full or not, from the live feed. Drawn only when there are some. */
export function Buildings({ section }: { section: BuildingsSection }) {
  const listings = useListings();
  const words = houseWords(useSite().site.look);
  if (listings.status !== "ready") return null;
  const buildings = listings.buildings.slice(
    0,
    section.fields.show === 6 ? 6 : 3,
  );
  if (buildings.length === 0) return null;
  return (
    <SectionShell section={section}>
      <div className="grid3">
        {buildings.map((building) => (
          <BuildingCard key={building.id} building={building} words={words} />
        ))}
      </div>
    </SectionShell>
  );
}
