import { PageHero } from "@/components/PageHero";
import { copy, site, type Locale } from "@/lib/site";

export function ImpressumView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <PageHero kicker={t.legal} title="Impressum" image="/images/woods.jpg" />
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-sm leading-7 text-muted lg:px-8">
          <p className="font-serif text-2xl text-ink">{site.name}</p>
          <p>
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}, {site.address.country[locale]}
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
            {site.legal.court}
            <br />
            UID: {site.legal.uid}
            <br />
            {site.legal.managers.join(", ")}
          </p>
          <p>{site.vetMark}</p>
        </div>
      </section>
    </>
  );
}
