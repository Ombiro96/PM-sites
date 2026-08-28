import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { resolveClient, canonicalOrigin } from "@/lib/brand/resolve";
import { themeToCssVars } from "@/lib/brand/theme";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileContactBar } from "@/components/layout/MobileContactBar";
import { OrganizationSchema } from "@/components/seo/StructuredData";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const client = await resolveClient();
  const { brand } = client;

  return {
    metadataBase: new URL(canonicalOrigin(client)),
    title: {
      default: brand.seo.titleDefault,
      template: brand.seo.titleTemplate,
    },
    description: brand.seo.description,
    keywords: brand.seo.keywords,
    applicationName: brand.company.name,
    openGraph: {
      type: "website",
      siteName: brand.company.name,
      title: brand.seo.titleDefault,
      description: brand.seo.description,
      locale: brand.seo.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: brand.seo.titleDefault,
      description: brand.seo.description,
    },
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await resolveClient();
  const { brand } = client;

  return (
    <html
      lang="en-KE"
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <head>
        <style>{`:root { ${themeToCssVars(brand.theme)} }`}</style>
      </head>
      <body className="flex min-h-screen flex-col pb-14 lg:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-brand focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-contrast"
        >
          Skip to content
        </a>
        <Header brand={brand} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer brand={brand} />
        <MobileContactBar brand={brand} />
        <OrganizationSchema client={client} />
      </body>
    </html>
  );
}
