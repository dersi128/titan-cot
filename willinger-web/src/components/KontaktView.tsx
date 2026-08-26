import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { copy, site, type Locale } from "@/lib/site";

const mapsSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  site.address.mapsQuery,
)}&z=15&output=embed`;

export function KontaktView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <PageHero
        kicker={t.kontaktKicker}
        title={t.kontaktTitle}
        lead={t.kontaktLead}
        image="/images/mist.jpg"
      />
      <section className="bg-ivory">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <ContactForm locale={locale} />
          <aside className="bg-pine text-cream">
            <div className="p-8">
              <p className="text-[0.7rem] tracking-[0.28em] uppercase text-gold">
                {t.betrieb}
              </p>
              <h2 className="mt-3 font-serif text-3xl">{site.name}</h2>
              <p className="mt-5 leading-7 text-cream/75">
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city}
                <br />
                {site.address.region}
              </p>
              <p className="mt-6 leading-8">
                <a className="hover:text-gold" href={site.phone.href}>
                  Tel. {site.phone.display}
                </a>
                <br />
                Fax {site.fax.display}
                <br />
                <a className="hover:text-gold" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
              <p className="mt-6 text-xs tracking-[0.16em] uppercase text-gold">
                {site.vetMark}
              </p>
            </div>
            <iframe
              title="Karte Untermarkersdorf"
              src={mapsSrc}
              className="h-72 w-full border-0 grayscale"
              loading="lazy"
            />
          </aside>
        </div>
      </section>
    </>
  );
}
