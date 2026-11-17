import { useEffect, useState } from "react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { MobileContactBar } from "@/components/layout/MobileContactBar";
import { MapLink } from "@/components/sections/contact";
import { UNAVAILABLE } from "@/components/sections/Houses";
import { NoPicture } from "@/components/ui";
import { ApiError, getHouse, housePath, recordTap } from "@/lib/listings/api";
import { availability, money } from "@/lib/listings/format";
import type { HouseDetail, ListingMedia } from "@/lib/listings/types";
import { useSite } from "@/lib/site/context";
import { HOUSES_PATH, houseWords } from "@/lib/site/pages";
import { paragraphs, safeUrl, telHref, whatsappHref } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "gone" }
  | { status: "ready"; house: HouseDetail };

function photosOf(
  house: HouseDetail,
): { small: string; large: string; caption: string }[] {
  const usable = (media: ListingMedia[] | undefined) =>
    (media ?? []).flatMap((item) => {
      if (item.kind !== "photo") return [];
      const large = safeUrl(item.url) ?? safeUrl(item.small_url);
      const small = safeUrl(item.small_url) ?? large;
      return large && small ? [{ small, large, caption: item.caption }] : [];
    });
  const own = usable(house.media);
  return own.length ? own : usable(house.property.media);
}

function Gallery({ house }: { house: HouseDetail }) {
  const photos = photosOf(house);
  const [chosen, setChosen] = useState(0);
  if (photos.length === 0) return <NoPicture className="gmain" />;
  const shown = photos[Math.min(chosen, photos.length - 1)];
  return (
    <div>
      <img
        className="gmain"
        src={shown.large}
        alt={shown.caption || house.title}
      />
      {photos.length > 1 ? (
        <div className="thumbs">
          {photos.slice(0, 8).map((photo, index) => (
            <button
              type="button"
              key={index}
              aria-pressed={index === chosen}
              aria-label={`Photo ${index + 1}`}
              onClick={() => setChosen(index)}
            >
              <img src={photo.small} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Amenities({
  title,
  items,
}: {
  title: string;
  items: { name: string; slug: string }[];
}) {
  if (!items?.length) return null;
  return (
    <div className="blk">
      <h2>{title}</h2>
      <ul className="amen">
        {items.map((item) => (
          <li key={item.slug}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

function Status({ title, text }: { title: string; text: string }) {
  const words = houseWords(useSite().site.look);
  return (
    <section className="sec pagehd">
      <div className="in">
        <div className="headg">
          <h1 className="ltitle">{title}</h1>
        </div>
        <p className="lead">{text}</p>
        <div className="row">
          <a className="btn" href={HOUSES_PATH}>
            See {words.many} to let
          </a>
        </div>
      </div>
    </section>
  );
}

function Loaded({ house }: { house: HouseDetail }) {
  const site = useSite();
  const words = houseWords(site.site.look);
  const building = house.property;
  const currency = house.currency;
  const phone = building.contact?.phone || site.facts.phone;
  const whatsapp = building.contact?.whatsapp_number || site.facts.whatsapp;
  const pageUrl = `${window.location.origin}${housePath(house)}`;
  const message = `Hello, I saw the ${house.title} on your website. Is it still available? When can I view it?`;
  const video = safeUrl(
    house.media?.find((item) => item.kind === "video_link")?.video_url,
  );
  const pin = building.pin;
  const serviceCharge =
    Number(house.service_charge) > 0 ? house.service_charge : null;
  const availableText = availability(house);

  const facts: [string, string][] = [];
  if (house.bedrooms !== null)
    facts.push([
      String(house.bedrooms),
      house.bedrooms === 1 ? "Bedroom" : "Bedrooms",
    ]);
  if (house.bathrooms !== null)
    facts.push([
      String(house.bathrooms),
      house.bathrooms === 1 ? "Bathroom" : "Bathrooms",
    ]);
  if (Number(house.size_sqm) > 0)
    facts.push([
      `${Number(house.size_sqm).toLocaleString("en-KE")} m²`,
      "Size",
    ]);
  facts.push([
    house.available_from ? availableText.replace("Available from ", "") : "Now",
    "Available",
  ]);

  return (
    <>
      <section className="sec pagehd">
        <div className="in wider">
          <nav className="crumbs" aria-label="You are here">
            <a href="/">Home</a>›<a href={HOUSES_PATH}>{words.nav}</a>›
            <span>{house.title}</span>
          </nav>
          <div className="detail">
            <div>
              <Gallery house={house} />
              <div className="blk" style={{ gap: 8 }}>
                <span className="eyebrow">
                  {house.location.name} · {availableText}
                </span>
                <h1 className="ltitle">{house.title}</h1>
                <p className="meta">
                  {house.location.full_name || house.location.name}
                  {house.landmark ? ` · ${house.landmark}` : ""} ·{" "}
                  {availableText}
                </p>
                <div className="price">
                  {money(house.rent_amount, currency) || "Rent on request"}
                  {house.rent_amount ? <small> / month</small> : null}
                </div>
                <div className="row">
                  <a
                    className="btn sm wa"
                    href={`https://wa.me/?text=${encodeURIComponent(`${house.title} ${pageUrl}`)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Share on WhatsApp
                  </a>
                  {video ? (
                    <a
                      className="btn sm line"
                      href={video}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Watch the video
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="facts">
                {facts.map(([value, label]) => (
                  <div className="fact" key={label}>
                    <b>{value}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {house.description ? (
                <div className="blk">
                  <h2>About this {words.one}</h2>
                  {paragraphs(house.description).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {house.rent_amount ? (
                <div className="blk">
                  <h2>Cost to move in</h2>
                  <dl className="costd">
                    <dt>First month's rent</dt>
                    <dd>{money(house.rent_amount, currency)}</dd>
                    {house.deposit_amount !== null ? (
                      <>
                        <dt>Deposit (refundable)</dt>
                        <dd>{money(house.deposit_amount, currency)}</dd>
                      </>
                    ) : null}
                    {serviceCharge ? (
                      <>
                        <dt>Service charge (monthly)</dt>
                        <dd>{money(serviceCharge, currency)}</dd>
                      </>
                    ) : null}
                    {house.move_in_total !== null ? (
                      <>
                        <dt className="tot">Total to move in</dt>
                        <dd className="tot">
                          {money(house.move_in_total, currency)}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                  {house.deposit_amount === null ? (
                    <p className="meta">Ask us about the deposit.</p>
                  ) : null}
                </div>
              ) : null}

              <Amenities
                title={`In the ${words.one}`}
                items={house.amenities}
              />
              <Amenities title="In the building" items={building.amenities} />

              {house.other_unit_types?.length ? (
                <div className="blk">
                  <h2>House types at {building.name}</h2>
                  <div className="trows">
                    <div className="here">
                      <span>
                        {house.label || house.category_label}
                        <br />
                        <span className="meta">{availableText}</span>
                      </span>
                      <span>
                        {money(house.rent_amount, currency)}{" "}
                        <span className="meta">/ month · this one</span>
                      </span>
                    </div>
                    {house.other_unit_types.map((other) => (
                      <div key={other.id}>
                        <span>
                          {other.label || other.category_label}
                          <br />
                          <span className="meta">{availability(other)}</span>
                        </span>
                        <span>
                          {money(other.rent_amount, other.currency)}{" "}
                          <span className="meta">/ month</span>{" "}
                          <a
                            className="btn line sm"
                            href={housePath(other)}
                            style={{ marginLeft: 10 }}
                          >
                            View
                          </a>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="blk">
                <h2>Location</h2>
                <p className="meta">
                  {building.name},{" "}
                  {building.location?.full_name || house.location.name}
                  {building.landmark ? ` · ${building.landmark}` : ""}
                </p>
                {building.description ? <p>{building.description}</p> : null}
                {pin ? (
                  <>
                    <MapLink
                      latitude={pin.latitude}
                      longitude={pin.longitude}
                      label={building.name}
                    />
                    {pin.exact ? null : (
                      <p className="meta">
                        The pin shows the area, not the exact building.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <div className="aside" id="ask">
              <div>
                <b style={{ fontSize: 18 }}>{site.facts.name}</b>
                {whatsapp ? (
                  <>
                    <br />
                    <span className="meta">Replies on WhatsApp</span>
                  </>
                ) : null}
              </div>
              {whatsapp ? (
                <a
                  className="btn wa"
                  href={whatsappHref(whatsapp, `${message} ${pageUrl}`)}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => recordTap(site.api, house.id, "whatsapp_tap")}
                >
                  WhatsApp
                </a>
              ) : null}
              {phone ? (
                <a
                  className="btn line"
                  href={telHref(phone)}
                  onClick={() => recordTap(site.api, house.id, "call_tap")}
                >
                  Call {phone}
                </a>
              ) : null}
              <EnquiryForm houseId={house.id} startMessage={message} />
            </div>
          </div>
        </div>
      </section>
      <MobileContactBar enquireHref="#ask" />
    </>
  );
}

/** One house, live. A house that is no longer advertised gets its own page with no enquiry form. */
export function HousePage({ id }: { id: string }) {
  const site = useSite();
  const words = houseWords(site.site.look);
  const [loaded, setLoaded] = useState<{ id: string; state: State } | null>(
    null,
  );
  const state: State = loaded?.id === id ? loaded.state : { status: "loading" };

  useEffect(() => {
    let current = true;
    getHouse(site.api, id)
      .then((house) => {
        if (!current) return;
        setLoaded({ id, state: { status: "ready", house } });
        document.title = `${house.title} | ${site.facts.name}`;
      })
      .catch((error: unknown) => {
        if (!current) return;
        const gone = error instanceof ApiError && error.status === 404;
        setLoaded({ id, state: { status: gone ? "gone" : "failed" } });
      });
    return () => {
      current = false;
    };
  }, [id, site.api, site.facts.name]);

  if (state.status === "ready")
    return <Loaded key={state.house.id} house={state.house} />;
  if (state.status === "gone") {
    return (
      <Status
        title={`This ${words.one} is no longer available`}
        text="It has been let or taken off the market. See what else is free."
      />
    );
  }
  if (state.status === "failed") {
    return (
      <>
        <Status
          title={UNAVAILABLE}
          text="We could not load this page just now. Please try again shortly, or contact us."
        />
        <MobileContactBar />
      </>
    );
  }
  return (
    <section className="sec pagehd" aria-busy="true">
      <div className="in wider">
        <span className="sr" role="status">
          Loading
        </span>
        <div className="detail" aria-hidden="true">
          <div>
            <div className="skel" style={{ aspectRatio: "3/2" }} />
            <div className="skel line1" />
            <div className="skel line2" />
          </div>
          <div>
            <div className="skel" style={{ height: 260 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
