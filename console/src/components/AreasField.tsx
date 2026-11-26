import { useState } from "react";
import { AREAS_MAX, type AreaGroup } from "../lib/company";

const INPUT =
  "border-line focus:border-brand focus:ring-brand-soft w-full rounded-lg border bg-white px-3 py-2.5 text-base outline-none focus:ring-4";

/** The areas the company works in, ticked from the places Bomahut's directory offers. */
export function AreasField({
  value,
  groups,
  problem,
  onChange,
}: {
  value: string[];
  /** Null while the places are being fetched. */
  groups: AreaGroup[] | null;
  /** Why the places could not be fetched. */
  problem?: string;
  onChange: (areas: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const sought = search.trim().toLowerCase();
  const full = value.length >= AREAS_MAX;
  const shown = (groups ?? [])
    .map((group) => ({
      ...group,
      areas: group.areas.filter((area) =>
        [group.country, group.name, area].some((text) =>
          text.toLowerCase().includes(sought),
        ),
      ),
    }))
    .filter((group) => group.areas.length > 0);
  const toggle = (area: string) =>
    onChange(
      value.includes(area)
        ? value.filter((each) => each !== area)
        : [...value, area],
    );

  return (
    <fieldset className="mb-4">
      <legend className="mb-1.5 text-sm font-medium">
        Areas you cover (optional)
      </legend>
      {value.length > 0 ? (
        <ul className="mb-2.5 flex flex-wrap gap-1.5">
          {value.map((area) => (
            <li
              key={area}
              className="bg-brand-soft text-brand flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm font-semibold"
            >
              {area}
              <button
                type="button"
                aria-label={`Remove ${area}`}
                onClick={() => toggle(area)}
                className="hover:text-bad flex size-6 items-center justify-center rounded-full text-base leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {problem ? (
        <p role="alert" className="text-bad text-sm">
          {problem}
        </p>
      ) : groups === null ? (
        <p className="text-ink-muted text-sm">Fetching the areas…</p>
      ) : (
        <>
          <input
            type="search"
            aria-label="Search areas"
            placeholder="Search a town or area"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={INPUT}
          />
          <div className="border-line mt-2 max-h-64 overflow-y-auto rounded-lg border bg-white px-3.5 py-1">
            {shown.length === 0 ? (
              <p className="text-ink-muted py-2.5 text-sm">
                No area matches your search.
              </p>
            ) : (
              shown.map((group) => (
                <div key={`${group.country} ${group.name}`} className="py-2.5">
                  <p className="text-ink-muted mb-1.5 text-xs font-bold tracking-wider uppercase">
                    {group.name}
                    {group.name === group.country ? "" : ` · ${group.country}`}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
                    {group.areas.map((area) => {
                      const ticked = value.includes(area);
                      return (
                        <label
                          key={area}
                          className={`flex min-h-9 items-center gap-2 text-[15px] ${full && !ticked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        >
                          <input
                            type="checkbox"
                            checked={ticked}
                            disabled={full && !ticked}
                            onChange={() => toggle(area)}
                            className="accent-brand size-4 shrink-0"
                          />
                          {area}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      <p className="text-ink-muted mt-1.5 text-sm">
        {value.length} of {AREAS_MAX} chosen. They are listed in the Areas we
        cover section of your website, which shows once you choose two or more.
      </p>
    </fieldset>
  );
}
