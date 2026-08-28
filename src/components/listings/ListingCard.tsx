import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/listings/types";
import { Badge } from "@/components/ui/primitives";
import { cn, formatMoney } from "@/lib/utils";

function AvailabilityBadge({ count }: { count: number }) {
  if (count <= 0) {
    return <Badge tone="neutral">Fully let</Badge>;
  }
  return (
    <Badge tone="available">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-emerald-600"
      />
      {count === 1 ? "1 available" : `${count} available`}
    </Badge>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-sm font-semibold text-ink">{value}</span>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

export function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing;
  priority?: boolean;
}) {
  const cover = listing.photos[0];
  const unavailable = listing.availableUnits <= 0;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-brand-lg border border-line bg-surface transition-shadow hover:shadow-lg",
        unavailable && "opacity-75",
      )}
    >
      <Link
        href={`/properties/${listing.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-muted"
      >
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-muted">
            Photos coming soon
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <AvailabilityBadge count={listing.availableUnits} />
          {listing.featured && !unavailable ? (
            <Badge tone="accent">Featured</Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
          {listing.area}
        </p>
        <h3 className="mt-2 font-display text-lg leading-snug font-semibold text-ink">
          <Link href={`/properties/${listing.slug}`} className="hover:text-brand">
            {listing.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{listing.propertyName}</p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
          {listing.bedrooms !== null ? (
            <Spec value={String(listing.bedrooms)} label="bed" />
          ) : null}
          {listing.bathrooms !== null ? (
            <Spec value={String(listing.bathrooms)} label="bath" />
          ) : null}
          {listing.sizeSqm !== null ? (
            <Spec value={String(listing.sizeSqm)} label="sqm" />
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <p>
            <span className="font-display text-xl font-semibold text-brand">
              {formatMoney(listing.rent, listing.currency)}
            </span>
            <span className="ml-1 text-sm text-ink-muted">/ month</span>
          </p>
          <Link
            href={`/properties/${listing.slug}`}
            className="text-sm font-semibold text-brand hover:text-accent"
          >
            View
            <span className="sr-only"> {listing.title} at {listing.propertyName}</span>
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
