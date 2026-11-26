import type { ReactNode } from "react";
import logo from "../assets/bomahut.svg";

/**
 * The page around the sign-in and sign-up forms: logo, title, form, links
 * underneath. With `aside`, wide screens show it beside the form; phones keep
 * the form alone.
 */
export function AuthLayout({
  title,
  children,
  links,
  aside,
}: {
  title: string;
  children: ReactNode;
  links: ReactNode;
  aside?: ReactNode;
}) {
  const form = (
    <div className="w-full max-w-md">
      <a href="/" className="mx-auto mb-6 block w-fit">
        <img
          src={logo}
          alt="Bomahut"
          className="h-12 w-auto"
          width={195}
          height={39}
        />
      </a>
      <div className="border-line rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold">{title}</h1>
        {children}
      </div>
      <div className="mt-5 flex justify-between px-1 text-sm">{links}</div>
    </div>
  );
  if (!aside)
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        {form}
      </main>
    );
  return (
    <main className="mx-auto grid min-h-dvh max-w-7xl items-center gap-12 px-4 py-10 lg:grid-cols-[28rem_minmax(0,1fr)] lg:px-8">
      <div className="flex justify-center">{form}</div>
      <div className="hidden lg:block">{aside}</div>
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
