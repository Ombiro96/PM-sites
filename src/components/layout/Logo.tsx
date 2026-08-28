import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/brand/types";
import { brandMonogram } from "@/lib/brand/monogram";
import { cn } from "@/lib/utils";

/**
 * Renders the client's logo, falling back to a typographic wordmark so a brand
 * can go live before its artwork arrives.
 */
export function Logo({
  brand,
  variant = "light",
  className,
}: {
  brand: Brand;
  variant?: "light" | "dark";
  className?: string;
}) {
  const src = variant === "dark" ? brand.logos.dark : brand.logos.light;
  const height = 36;

  return (
    <Link
      href="/"
      aria-label={`${brand.company.name} home`}
      className={cn("inline-flex items-center gap-3", className)}
    >
      {src ? (
        <Image
          src={src}
          alt={brand.company.name}
          width={Math.round(height * brand.logos.aspectRatio)}
          height={height}
          priority
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-brand-sm text-sm font-bold",
              variant === "dark"
                ? "bg-accent text-accent-contrast"
                : "bg-brand text-brand-contrast",
            )}
          >
            {brandMonogram(brand)}
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "font-display text-lg font-semibold tracking-tight",
                variant === "dark" ? "text-white" : "text-ink",
              )}
            >
              {brand.company.name}
            </span>
            <span
              className={cn(
                "mt-1 text-[10px] font-medium tracking-[0.16em] uppercase",
                variant === "dark" ? "text-white/60" : "text-ink-muted",
              )}
            >
              {brand.contact.city}
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
