import { useState } from "react";
import type { SiteData } from "@/lib/site/types";
import { SitePreview } from "./SitePreview";

const DEVICES = {
  desktop: { label: "Computer", width: 1280, height: 800, frame: "" },
  tablet: { label: "Tablet", width: 820, height: 1100, frame: "max-w-2xl" },
  phone: { label: "Phone", width: 390, height: 780, frame: "max-w-sm" },
} as const;

type Device = keyof typeof DEVICES;

/** A site drawn as on a computer, a tablet or a phone, with the switch between them. */
export function PreviewPanel({
  site,
  caption,
  path,
  selected,
  onPick,
  onGo,
}: {
  site: SiteData;
  caption: string;
  path?: string;
  selected?: string;
  onPick?: (sectionId: string) => void;
  onGo?: (path: string) => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <section aria-label="Preview" className="lg:sticky lg:top-20 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-ink-muted text-sm">{caption}</p>
        <div className="border-line flex rounded-lg border bg-white p-0.5 text-sm">
          {(Object.keys(DEVICES) as Device[]).map((each) => (
            <button
              key={each}
              type="button"
              aria-pressed={each === device}
              onClick={() => setDevice(each)}
              className={`rounded-md px-3 py-1 font-medium ${each === device ? "bg-brand text-white" : "text-ink-muted"}`}
            >
              {DEVICES[each].label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`border-line mx-auto overflow-hidden rounded-xl border shadow-lg ${DEVICES[device].frame}`}
      >
        <SitePreview
          site={site}
          title="Preview of your website"
          interactive
          width={DEVICES[device].width}
          height={DEVICES[device].height}
          path={path}
          selected={selected}
          onPick={onPick}
          onGo={onGo}
        />
      </div>
    </section>
  );
}
