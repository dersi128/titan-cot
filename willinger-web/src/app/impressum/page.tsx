import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <>
      <PageHero
        kicker="Rechtliches"
        title="Impressum"
        image="/images/woods.jpg"
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-sm leading-7 text-muted lg:px-8">
          <p className="font-serif text-2xl text-ink">{site.name}</p>
          <p>
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}, {site.address.country}
          </p>
          <p>
            Tel. {site.phone.display}
            <br />
            Fax {site.fax.display}
            <br />
            E-Mail: {site.email}
          </p>
          <p>
            {site.legal.fn}
            <br />
            Firmenbuchgericht: {site.legal.court}
            <br />
            UID: {site.legal.uid}
            <br />
            Geschäftsführung: {site.legal.managers.join(", ")}
          </p>
          <p>
            Veterinärkontrollnummer: {site.vetMark}
            <br />
            Gegenstand: Übernahme, Zerlegung und Handel von Wild und Fleisch.
          </p>
        </div>
      </section>
    </>
  );
}
