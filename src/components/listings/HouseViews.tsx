import { NoPicture } from "@/components/ui";
import { housePath } from "@/lib/listings/api";
import { availability, coverUrl, money, moveInLine } from "@/lib/listings/format";
import type { Building, HouseCard, ListingCover } from "@/lib/listings/types";
import type { HouseWords } from "@/lib/site/pages";

function Cover({ cover, alt, size = "small" }: { cover: ListingCover | null; alt: string; size?: "small" | "large" }) {
  const url = coverUrl(cover, size);
  return url ? <img src={url} alt={alt} loading="lazy" decoding="async" /> : <NoPicture />;
}

function houseName(house: HouseCard): string {
  return `${house.label || house.category_label} · ${house.property.name}`;
}

function Rent({ house }: { house: HouseCard }) {
  const rent = money(house.rent_amount, house.currency);
  return (
    <span className="rent">
      {rent || "Rent on request"}
      {rent ? <small> / month</small> : null}
    </span>
  );
}

export function HouseCardView({ house, words }: { house: HouseCard; words: HouseWords }) {
  const moveIn = moveInLine(house);
  return (
    <a className="card" href={housePath(house)}>
      <Cover cover={house.cover} alt="" />
      <div className="b">
        <Rent house={house} />
        <b>{houseName(house)}</b>
        <span className="meta">{house.location.name}</span>
        <span className="av">{availability(house)}</span>
        {moveIn ? <span className="meta">{moveIn}</span> : null}
        <span className="btn sm">{words.view}</span>
      </div>
    </a>
  );
}

export function HouseListRow({ house }: { house: HouseCard }) {
  const total = house.move_in_total ? ` · total to move in ${money(house.move_in_total, house.currency)}` : "";
  return (
    <a href={housePath(house)}>
      <Cover cover={house.cover} alt="" />
      <span>
        <b>{houseName(house)}</b>
        <br />
        <span className="meta">
          {availability(house)}
          {total}
        </span>
      </span>
      <Rent house={house} />
      <span className="btn sm">View</span>
    </a>
  );
}

export function HouseLargeRow({ house, words }: { house: HouseCard; words: HouseWords }) {
  const moveIn = moveInLine(house);
  return (
    <div className="frow">
      <Cover cover={house.cover} alt="" size="large" />
      <div>
        <span className="eyebrow">
          {house.location.name} · {availability(house)}
        </span>
        <h3>
          {house.label || house.category_label}, {house.property.name}
        </h3>
        <Rent house={house} />
        {moveIn ? <span className="meta">{moveIn}</span> : null}
        <a className="btn line" href={housePath(house)}>
          {words.view}
        </a>
      </div>
    </div>
  );
}

export function BuildingCard({ building, words }: { building: Building; words: HouseWords }) {
  return (
    <article className="card">
      <Cover cover={building.cover} alt="" />
      <div className="b">
        <b style={{ fontSize: 18 }}>{building.name}</b>
        <span className="meta">
          {building.area} · {building.houseTypes} {building.houseTypes === 1 ? words.one : words.many} to let
        </span>
      </div>
    </article>
  );
}

export function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="grid3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="card" key={index}>
          <div className="skel pic" />
          <div className="b">
            <div className="skel line1" />
            <div className="skel line2" />
            <div className="skel line2" />
          </div>
        </div>
      ))}
    </div>
  );
}
