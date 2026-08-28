"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { AreaItem } from "@/lib/brand/types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Any type" },
  { value: "apartment", label: "Apartment" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "House" },
  { value: "maisonette", label: "Maisonette" },
  { value: "townhouse", label: "Townhouse" },
  { value: "office", label: "Office" },
  { value: "shop", label: "Shop" },
];

const BEDROOMS = [
  { value: "", label: "Any" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4+" },
];

const SORTS = [
  { value: "", label: "Recommended" },
  { value: "rent-asc", label: "Rent: low to high" },
  { value: "rent-desc", label: "Rent: high to low" },
  { value: "beds-desc", label: "Most bedrooms" },
];

const FIELD =
  "h-11 w-full rounded-brand border border-line bg-surface px-3 text-sm text-ink";

export function ListingFilters({
  areas,
  resultCount,
}: {
  areas: AreaItem[];
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const hasFilters = ["q", "area", "category", "bedrooms", "maxRent", "sort"].some(
    (key) => searchParams.get(key),
  );

  return (
    <div
      className={cn(
        "rounded-brand-lg border border-line bg-surface p-4 sm:p-5",
        pending && "opacity-70",
      )}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="lg:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="Area, property or type"
            onChange={(event) => setParam("q", event.target.value)}
            className={FIELD}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Area
          </span>
          <select
            defaultValue={searchParams.get("area") ?? ""}
            onChange={(event) => setParam("area", event.target.value)}
            className={FIELD}
          >
            <option value="">All areas</option>
            {areas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Property type
          </span>
          <select
            defaultValue={searchParams.get("category") ?? ""}
            onChange={(event) => setParam("category", event.target.value)}
            className={FIELD}
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Bedrooms
          </span>
          <select
            defaultValue={searchParams.get("bedrooms") ?? ""}
            onChange={(event) => setParam("bedrooms", event.target.value)}
            className={FIELD}
          >
            {BEDROOMS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-sm text-ink-muted" aria-live="polite">
          <span className="font-semibold text-ink">{resultCount}</span>{" "}
          {resultCount === 1 ? "home" : "homes"} matching
        </p>
        <div className="flex items-center gap-3">
          {hasFilters ? (
            <button
              type="button"
              onClick={() => startTransition(() => router.replace(pathname))}
              className="text-sm font-semibold text-brand hover:text-accent"
            >
              Clear filters
            </button>
          ) : null}
          <label className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted">Sort</span>
            <select
              defaultValue={searchParams.get("sort") ?? ""}
              onChange={(event) => setParam("sort", event.target.value)}
              className="h-9 rounded-brand border border-line bg-surface px-2 text-sm"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
