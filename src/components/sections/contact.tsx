import { LeadForm } from "@/components/forms/LeadForm";
import { Eyebrow, SectionShell } from "@/components/ui";
import { useSite } from "@/lib/site/context";
import type {
  ContactSection,
  ManagementRequestSection,
  MessageFormSection,
} from "@/lib/site/types";
import { telHref, whatsappHref } from "@/lib/utils";

export function mapHref(
  latitude: number | string,
  longitude: number | string,
): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

export function MapLink({
  latitude,
  longitude,
  label,
}: {
  latitude: number | string;
  longitude: number | string;
  label: string;
}) {
  return (
    <a
      className="map"
      href={mapHref(latitude, longitude)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${label}: open the map`}
    >
      <span>Open in Google Maps</span>
    </a>
  );
}

/** Phone, WhatsApp, email, office and hours from the company facts. Empty facts are left out; no pin, no map. */
export function Contact({ section }: { section: ContactSection }) {
  const { facts } = useSite();
  const hasPin = facts.latitude !== null && facts.longitude !== null;
  const details = (
    <dl className="kv">
      {facts.phone ? (
        <>
          <dt>Phone</dt>
          <dd>
            <a href={telHref(facts.phone)}>{facts.phone}</a>
          </dd>
        </>
      ) : null}
      {facts.whatsapp ? (
        <>
          <dt>WhatsApp</dt>
          <dd>
            <a
              href={whatsappHref(facts.whatsapp)}
              target="_blank"
              rel="noreferrer noopener"
            >
              {facts.whatsapp}
            </a>
          </dd>
        </>
      ) : null}
      {facts.email ? (
        <>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${facts.email}`}>{facts.email}</a>
          </dd>
        </>
      ) : null}
      {facts.office_address ? (
        <>
          <dt>Office</dt>
          <dd>{facts.office_address}</dd>
        </>
      ) : null}
      {facts.opening_hours ? (
        <>
          <dt>Hours</dt>
          <dd>{facts.opening_hours}</dd>
        </>
      ) : null}
    </dl>
  );
  return (
    <SectionShell section={section}>
      {hasPin ? (
        <div className="two">
          <div>{details}</div>
          <MapLink
            latitude={facts.latitude as number}
            longitude={facts.longitude as number}
            label={facts.name}
          />
        </div>
      ) : (
        <div className="one">{details}</div>
      )}
    </SectionShell>
  );
}

/** Owners ask the manager to take on their building, by form or straight to WhatsApp. */
export function ManagementRequest({
  section,
}: {
  section: ManagementRequestSection;
}) {
  const { facts } = useSite();
  const { fields } = section;
  // WhatsApp mode needs a number; without one the form is shown instead.
  const byWhatsapp = fields.mode === "whatsapp" && facts.whatsapp !== "";
  const words = (
    <>
      <Eyebrow type="management_request" />
      <h2>{fields.heading}</h2>
      {fields.text ? <p className="lead">{fields.text}</p> : null}
    </>
  );
  return (
    <SectionShell section={section} ownHeading>
      {byWhatsapp ? (
        <div className="one">
          {words}
          <a
            className="btn wa"
            href={whatsappHref(
              facts.whatsapp,
              "Hello, I own a building and would like you to manage it.",
            )}
            target="_blank"
            rel="noreferrer noopener"
          >
            Message us on WhatsApp
          </a>
        </div>
      ) : (
        <div className="two top">
          <div>{words}</div>
          <LeadForm kind="management_request" />
        </div>
      )}
    </SectionShell>
  );
}

/** A visitor writes to the manager and says who they are. */
export function MessageForm({ section }: { section: MessageFormSection }) {
  const { facts } = useSite();
  const { fields } = section;
  return (
    <SectionShell section={section} ownHeading>
      <div className="two top">
        <div>
          <Eyebrow type="message_form" />
          <h2>{fields.heading}</h2>
          {fields.text ? <p className="lead">{fields.text}</p> : null}
          <div className="direct">
            {facts.whatsapp ? (
              <a
                className="btn wa"
                href={whatsappHref(facts.whatsapp)}
                target="_blank"
                rel="noreferrer noopener"
              >
                WhatsApp {facts.whatsapp}
              </a>
            ) : null}
            {facts.phone ? (
              <span className="meta">
                {facts.whatsapp ? "or call " : "Call "}
                <a href={telHref(facts.phone)}>{facts.phone}</a>
                {facts.opening_hours ? ` · ${facts.opening_hours}` : ""}
              </span>
            ) : null}
          </div>
        </div>
        <LeadForm kind="message" />
      </div>
    </SectionShell>
  );
}
