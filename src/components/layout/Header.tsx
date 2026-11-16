"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink, Container } from "@/components/ui/primitives";
import type { ResolvedButton } from "@/lib/site/actions";
import type { NavItem } from "@/lib/site/pages";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const TENANT_LOGIN_CLASSES =
  "rounded-brand border-[1.5px] border-current px-3 py-1.5 text-sm font-semibold";

export function Header({
  name,
  monogram,
  logoUrl,
  nav,
  tenantLoginUrl,
  contact,
}: {
  name: string;
  monogram: string;
  logoUrl: string | null;
  nav: NavItem[];
  tenantLoginUrl: string | null;
  contact: ResolvedButton;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const contactProps = {
    href: contact.href,
    target: contact.external ? "_blank" : undefined,
    rel: contact.external ? "noreferrer noopener" : undefined,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-header text-header-ink">
      <Container className="flex items-center justify-between gap-5 py-[13px]">
        <Logo name={name} monogram={monogram} logoUrl={logoUrl} />

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-5 lg:flex"
        >
          {nav.map((item) => {
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
                  "text-[15px] font-semibold decoration-2 underline-offset-[6px] hover:underline",
                  active && "underline",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {tenantLoginUrl ? (
            <a
              href={tenantLoginUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={TENANT_LOGIN_CLASSES}
            >
              Tenant login
            </a>
          ) : null}
          <ButtonLink size="sm" {...contactProps}>
            {contact.label}
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center rounded-brand border border-current/30 lg:hidden"
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
        <div id="mobile-nav" className="border-t border-current/15 lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-brand px-3 py-3 text-base font-semibold hover:bg-current/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2">
              {tenantLoginUrl ? (
                <a
                  href={tenantLoginUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(TENANT_LOGIN_CLASSES, "py-3 text-center")}
                >
                  Tenant login
                </a>
              ) : null}
              <ButtonLink {...contactProps}>{contact.label}</ButtonLink>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
