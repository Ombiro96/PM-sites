import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-(--wide) px-[22px]", className)}>
      {children}
    </div>
  );
}

export function Section({
  className,
  tone = "surface",
  children,
  id,
}: {
  className?: string;
  tone?: "surface" | "muted" | "brand";
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-24",
        tone === "muted" && "bg-surface-muted",
        tone === "brand" && "bg-brand text-brand-contrast",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "left",
  inverted = false,
}: {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  align?: "left" | "center";
  inverted?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold tracking-[0.18em] uppercase",
            inverted ? "text-accent" : "text-accent",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl leading-tight font-semibold text-balance sm:text-4xl",
          inverted ? "text-brand-contrast" : "text-ink",
        )}
      >
        {heading}
      </h2>
      {subheading ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            inverted ? "text-brand-contrast/80" : "text-ink-muted",
          )}
        >
          {subheading}
        </p>
      ) : null}
    </div>
  );
}

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "accent"
  | "inverse";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-brand bg-brand text-brand-contrast hover:border-brand-deep hover:bg-brand-deep",
  accent: "border-accent bg-accent text-accent-contrast hover:brightness-95",
  secondary: "border-line bg-surface text-ink hover:bg-surface-muted",
  outline: "border-current bg-transparent text-current hover:bg-current/10",
  ghost: "border-transparent text-brand hover:bg-brand/5",
  inverse: "border-white bg-white text-brand-deep hover:bg-white/90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-[7px] text-[14.5px]",
  md: "px-5 py-[11px] text-base",
  lg: "px-7 py-3.5 text-base",
};

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-brand border-2 leading-tight font-bold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "available" | "accent";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-brand-sm px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-surface-muted text-ink-muted",
        tone === "available" && "bg-emerald-50 text-emerald-800",
        tone === "accent" && "bg-accent text-accent-contrast",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-brand-lg border border-line bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}
