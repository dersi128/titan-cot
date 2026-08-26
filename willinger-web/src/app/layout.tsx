import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { copy, site } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.productionUrl),
  title: {
    default: `${site.name} · Weinviertel`,
    template: `%s · ${site.shortName}`,
  },
  description: copy.de.description,
  alternates: {
    languages: {
      "de-AT": "/",
      cs: "/cs",
    },
  },
  openGraph: {
    title: site.name,
    description: copy.de.description,
    locale: "de_AT",
    type: "website",
    url: site.productionUrl,
    images: [{ url: "/images/deer.jpg" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: site.name,
    description: copy.de.description,
    url: site.productionUrl,
    telephone: "+4329433682",
    email: site.email,
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.zip,
      addressLocality: site.address.city,
      addressRegion: "Niederösterreich",
      addressCountry: "AT",
    },
  };

  return (
    <html
      lang="de-AT"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main id="inhalt" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
