import type { ReactNode } from "react";
import type { ResolvedPicture } from "@/lib/site/pictures";
import type { ResolvedButton } from "@/lib/site/actions";
import { backgroundOf, EYEBROWS } from "@/lib/site/wording";
import type { Section } from "@/lib/site/types";
import { cx } from "@/lib/utils";

export function ActionLink({
  button,
  className,
}: {
  button: ResolvedButton | null;
  className?: string;
}) {
  if (!button) return null;
  return (
    <a
      className={cx("btn", className)}
      href={button.href}
      target={button.external ? "_blank" : undefined}
      rel={button.external ? "noreferrer noopener" : undefined}
    >
      {button.label}
    </a>
  );
}

export function Picture({
  picture,
  size = "small",
  eager,
  className,
}: {
  picture: ResolvedPicture;
  size?: "small" | "large";
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={picture[size]}
      alt={picture.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ objectPosition: picture.position }}
    />
  );
}

/** What is drawn where a picture is missing: a tinted block with a building outline. */
export function NoPicture({ className }: { className?: string }) {
  return (
    <div className={cx("nopic", className)} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V10h5a1 1 0 0 1 1 1v10M8 8h2M8 12h2M8 16h2M16 14h1M16 18h1" />
      </svg>
    </div>
  );
}

const BACKGROUND_CLASS = { white: "", tinted: "bg-tint", brand: "bg-brand" };

export function Eyebrow({ type }: { type: Section["type"] }) {
  const text = EYEBROWS[type];
  return text ? <span className="eyebrow">{text}</span> : null;
}

/** The outer band of a section: its background, its anchor id and, unless the section draws its own, its heading. */
export function SectionShell({
  section,
  ownHeading,
  className,
  children,
}: {
  section: Section;
  ownHeading?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const heading = section.fields?.heading;
  return (
    <section id={section.id} className={cx("sec", BACKGROUND_CLASS[backgroundOf(section)], className)}>
      <div className="in">
        {!ownHeading && heading ? (
          <div className="headg">
            <Eyebrow type={section.type} />
            <h2>{heading}</h2>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
