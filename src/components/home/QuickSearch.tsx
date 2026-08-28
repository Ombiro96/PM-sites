"use client";

import { useRouter } from "next/navigation";
import type { AreaItem } from "@/lib/brand/types";
import { Button } from "@/components/ui/primitives";

const FIELD =
  "h-12 w-full rounded-brand border border-line bg-surface px-3 text-sm text-ink";

export function QuickSearch({ areas }: { areas: AreaItem[] }) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["area", "category", "bedrooms", "maxRent"]) {
      const value = String(data.get(key) ?? "");
      if (value) params.set(key, value);
    }
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Search available homes"
      className="grid gap-3 rounded-brand-lg border border-line bg-surface p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto] lg:p-5"
    >
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Area
        </span>
        <select name="area" className={FIELD} defaultValue="">
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
        <select name="category" className={FIELD} defaultValue="">
          <option value="">Any type</option>
          <option value="apartment">Apartment</option>
          <option value="bedsitter">Bedsitter</option>
          <option value="studio">Studio</option>
          <option value="house">House</option>
          <option value="maisonette">Maisonette</option>
          <option value="townhouse">Townhouse</option>
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Bedrooms
        </span>
        <select name="bedrooms" className={FIELD} defaultValue="">
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Max rent
        </span>
        <select name="maxRent" className={FIELD} defaultValue="">
          <option value="">No maximum</option>
          <option value="25000">Up to KES 25,000</option>
          <option value="50000">Up to KES 50,000</option>
          <option value="80000">Up to KES 80,000</option>
          <option value="120000">Up to KES 120,000</option>
          <option value="250000">Up to KES 250,000</option>
        </select>
      </label>

      <div className="flex items-end">
        <Button type="submit" size="lg" className="h-12 w-full lg:w-auto">
          Search homes
        </Button>
      </div>
    </form>
  );
}
