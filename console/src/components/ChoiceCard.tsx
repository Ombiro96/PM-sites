import type { ReactNode } from "react";

/** One option of a single-choice group, drawn as a card. `children` sit above its name. */
export function ChoiceCard({
  group,
  value,
  chosen,
  onChoose,
  name,
  summary,
  children,
}: {
  group: string;
  value: string;
  chosen: boolean;
  onChoose: () => void;
  name: string;
  summary: string;
  children?: ReactNode;
}) {
  return (
    <label className="border-line has-checked:border-brand has-checked:ring-brand-soft has-focus-visible:outline-brand block cursor-pointer overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md has-checked:ring-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2">
      <input
        type="radio"
        name={group}
        value={value}
        checked={chosen}
        onChange={onChoose}
        className="sr-only"
      />
      {children}
      <span className="block px-3.5 py-3">
        <span className="flex items-center justify-between gap-2 font-semibold">
          {name}
          {chosen ? (
            <span className="bg-brand rounded-full px-2 py-0.5 text-xs font-medium text-white">
              Chosen
            </span>
          ) : null}
        </span>
        <span className="text-ink-muted mt-0.5 block text-sm">{summary}</span>
      </span>
    </label>
  );
}
