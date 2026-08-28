import Link from "next/link";
import type { Brand } from "@/lib/brand/types";
import { Container } from "@/components/ui/primitives";
import { telHref } from "@/lib/utils";
import { Logo } from "./Logo";

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export function Footer({ brand }: { brand: Brand }) {
  const social = Object.entries(brand.social).filter(([, href]) => Boolean(href));

  return (
    <footer className="bg-brand-deep text-white/70">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo brand={brand} variant="dark" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              {brand.company.tagline}
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic">
              {brand.contact.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p>{brand.contact.city}</p>
            </address>
            <div className="mt-5 space-y-1 text-sm">
              <p>
                <a
                  href={telHref(brand.contact.phone)}
                  className="font-semibold text-white hover:text-accent"
                >
                  {brand.contact.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${brand.contact.email}`}
                  className="hover:text-accent"
                >
                  {brand.contact.email}
                </a>
              </p>
            </div>
          </div>

          {brand.footerLinks.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-display text-sm font-semibold tracking-[0.14em] text-white uppercase">
                {group.heading}
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {group.items.map((item) => (
                  <li key={`${group.heading}-${item.href}-${item.label}`}>
                    <Link href={item.href} className="hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {brand.company.legalName}. All rights
            reserved.
          </p>
          {social.length > 0 ? (
            <ul className="flex gap-5">
              {social.map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href as string}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-accent"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-white/40">
            Powered by{" "}
            <a
              href="https://www.bomahut.com"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-accent"
            >
              Bomahut
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
