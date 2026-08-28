"use client";

import Image from "next/image";
import { useState } from "react";
import type { ListingPhoto } from "@/lib/listings/types";
import { cn } from "@/lib/utils";

export function ListingGallery({ photos }: { photos: ListingPhoto[] }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-brand-lg bg-surface-muted text-sm text-ink-muted">
        Photography coming soon
      </div>
    );
  }

  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-brand-lg bg-surface-muted">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {photos.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {photos.map((photo, index) => (
            <li key={photo.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-brand border-2",
                  index === active ? "border-brand" : "border-transparent",
                )}
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
