import { useSite } from "@/lib/site/context";
import { telHref, whatsappHref } from "@/lib/utils";

/** WhatsApp and Call, fixed to the bottom of a phone screen. A house page adds its own Enquire button. */
export function MobileContactBar({ enquireHref }: { enquireHref?: string }) {
  const { facts } = useSite();
  if (!facts.phone && !facts.whatsapp) return null;
  return (
    <div className="mbar">
      {facts.whatsapp ? (
        <a className="btn wa sm" href={whatsappHref(facts.whatsapp)} target="_blank" rel="noreferrer noopener">
          WhatsApp
        </a>
      ) : null}
      {facts.phone ? (
        <a className="btn line sm" href={telHref(facts.phone)}>
          Call
        </a>
      ) : null}
      {enquireHref ? (
        <a className="btn sm" href={enquireHref}>
          Enquire
        </a>
      ) : null}
    </div>
  );
}
