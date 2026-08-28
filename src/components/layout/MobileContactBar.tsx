import type { Brand } from "@/lib/brand/types";
import { telHref, whatsappHref } from "@/lib/utils";

/**
 * Kenyan property search happens on a phone, and the enquiry path has to be one
 * thumb-tap away. Pinned to the bottom of the viewport on small screens only.
 */
export function MobileContactBar({ brand }: { brand: Brand }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-surface shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
      <a
        href={telHref(brand.contact.phone)}
        className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-brand"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
        </svg>
        Call us
      </a>
      {brand.contact.whatsapp ? (
        <a
          href={whatsappHref(
            brand.contact.whatsapp,
            `Hello ${brand.company.name}, I would like to enquire about a property.`,
          )}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center justify-center gap-2 border-l border-line py-4 text-sm font-semibold text-emerald-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.9-1.6-.9-2.4s.4-1.3.6-1.5c.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.4.7 1 1.3 1.6 1.8.6.4 1 .6 1.2.7.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.4.4.1.2.1.7-.1 1.3Z" />
          </svg>
          WhatsApp
        </a>
      ) : (
        <a
          href={`mailto:${brand.contact.email}`}
          className="flex items-center justify-center gap-2 border-l border-line py-4 text-sm font-semibold text-ink"
        >
          Email us
        </a>
      )}
    </div>
  );
}
