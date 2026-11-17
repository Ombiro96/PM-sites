import type { ReactNode } from "react";
import logo from "../assets/bomahut.svg";

/** The page around the sign-in and sign-up forms: logo, title, form, links underneath. */
export function AuthLayout({
  title,
  children,
  links,
}: {
  title: string;
  children: ReactNode;
  links: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <img
          src={logo}
          alt="Bomahut"
          className="mx-auto mb-6 h-12 w-auto"
          width={195}
          height={39}
        />
        <div className="border-line rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-center text-2xl font-semibold">{title}</h1>
          {children}
        </div>
        <div className="mt-5 flex justify-between px-1 text-sm">{links}</div>
      </div>
    </main>
  );
}

export function TextLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className="text-brand font-medium hover:underline"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
