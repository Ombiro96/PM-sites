import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import type { CSSProperties } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileContactBar } from "@/components/layout/MobileContactBar";
import { OrganizationSchema } from "@/components/seo/StructuredData";
import { headerContactButton } from "@/lib/site/actions";
import { monogram } from "@/lib/site/monogram";
import { siteOrigin } from "@/lib/site/origin";
import { findPage, navItems, TENANT_LOGIN_URL } from "@/lib/site/pages";
import { getSite } from "@/lib/site/source";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const name = site.facts.display_name;
  const description = findPage(site.document, "home")?.search_description;

  return {
    metadataBase: new URL(await siteOrigin()),
    title: { default: name, template: `%s | ${name}` },
    description,
    applicationName: name,
    openGraph: { type: "website", siteName: name, title: name, description },
    robots: { index: site.status === "live", follow: site.status === "live" },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSite();
  const { facts, document } = site;
  const live = site.status === "live";

  return (
    <html
      lang="en-KE"
      className={`look-${site.look} ${fraunces.variable} ${figtree.variable}`}
      style={{ "--brand": site.brand_colour } as CSSProperties}
    >
      <body className="flex min-h-screen flex-col pb-14 lg:pb-0">
        {live ? (
          <>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-brand focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-contrast"
            >
              Skip to content
            </a>
            <Header
              name={facts.display_name}
              monogram={monogram(facts.display_name)}
              logoUrl={facts.logo_url}
              nav={navItems(document)}
              tenantLoginUrl={
                document.header.show_tenant_login ? TENANT_LOGIN_URL : null
              }
              contact={headerContactButton(site)}
            />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer
              facts={facts}
              showSocial={document.footer.show_social}
              showCredit={site.show_credit}
              reportUrl={process.env.PM_SITES_REPORT_URL ?? null}
            />
            <MobileContactBar
              name={facts.display_name}
              phone={facts.phone}
              whatsapp={facts.whatsapp_number}
            />
            <OrganizationSchema
              facts={facts}
              origin={await siteOrigin()}
              description={findPage(document, "home")?.search_description}
            />
          </>
        ) : (
          <main className="grid flex-1 place-items-center px-6 text-center">
            <p className="text-lg text-ink-muted">This site is not available.</p>
          </main>
        )}
      </body>
    </html>
  );
}
