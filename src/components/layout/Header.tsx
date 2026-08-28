"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Brand } from "@/lib/brand/types";
import { cn, telHref } from "@/lib/utils";
import { Container, ButtonLink } from "@/components/ui/primitives";
import { Logo } from "./Logo";

export function Header({ brand }: { brand: Brand }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="hidden bg-brand-deep text-brand-contrast lg:block">
        <Container className="flex h-10 items-center justify-between text-xs">
          <p className="text-white/70">{brand.contact.officeHours}</p>
          <div className="flex items-center gap-6">
            <a
              href={telHref(brand.contact.phone)}
              className="font-semibold hover:text-accent"
            >
              {brand.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${brand.contact.email}`}
              className="text-white/70 hover:text-accent"
            >
              {brand.contact.email}
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex h-18 items-center justify-between gap-6">
        <Logo brand={brand} />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {brand.nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-brand" : "text-ink-muted hover:text-brand",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="/tenant-portal" variant="secondary" size="sm">
            Tenant login
          </ButtonLink>
          <ButtonLink href="/contact" size="sm">
            Enquire
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center rounded-brand border border-line lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </Container>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-surface lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {brand.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-brand px-3 py-3 text-base font-medium text-ink hover:bg-surface-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2">
              <ButtonLink href="/tenant-portal" variant="secondary" size="md">
                Tenant login
              </ButtonLink>
              <ButtonLink href="/contact" size="md">
                Send an enquiry
              </ButtonLink>
              <a
                href={telHref(brand.contact.phone)}
                className="py-2 text-center text-sm font-semibold text-brand"
              >
                Call {brand.contact.phoneDisplay}
              </a>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
