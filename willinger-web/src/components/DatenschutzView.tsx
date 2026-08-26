import { PageHero } from "@/components/PageHero";
import { copy, site, type Locale } from "@/lib/site";

export function DatenschutzView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <PageHero
        kicker={t.legal}
        title={locale === "cs" ? "Ochrana údajů" : "Datenschutz"}
        image="/images/woods.jpg"
      />
      <section className="bg-ivory">
        <article className="mx-auto max-w-3xl space-y-5 px-5 py-16 text-sm leading-7 text-muted lg:px-8">
          <p>
            {site.name}, {site.address.street}, {site.address.zip}{" "}
            {site.address.city}, {site.email}.
          </p>
          <p>{t.privacyP1}</p>
          <p>{t.privacyP2}</p>
          <p>{t.privacyP3}</p>
          <p>{t.privacyP4}</p>
        </article>
      </section>
    </>
  );
}
