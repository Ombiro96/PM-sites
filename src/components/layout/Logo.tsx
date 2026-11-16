import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_HEIGHT = 36;

/** The company logo, or its initials and name as a wordmark when there is none. */
export function Logo({
  name,
  monogram,
  logoUrl,
  className,
}: {
  name: string;
  monogram: string;
  logoUrl: string | null;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {logoUrl ? (
        // The logo's proportions are unknown, so it is sized by height alone.
        <Image
          src={logoUrl}
          alt={name}
          width={LOGO_HEIGHT * 4}
          height={LOGO_HEIGHT}
          priority
          className="h-9 w-auto"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-brand bg-brand text-[13px] font-bold text-brand-contrast"
          >
            {monogram}
          </span>
          <span className="font-display text-[19px] leading-none font-bold">
            {name}
          </span>
        </>
      )}
    </Link>
  );
}
