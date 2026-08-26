import { PageHero } from "@/components/PageHero";
import { copy, site, type Locale } from "@/lib/site";

export function AktuellView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <PageHero
        kicker={t.aktuellKicker}
        title={t.aktuellTitle}
        lead={t.aktuellLead}
        image="/images/woods.jpg"
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {t.steps.map((step, index) => (
              <article key={step.title} className="border-t border-gold pt-6">
                <p className="font-serif text-4xl text-gold">0{index + 1}</p>
                <h2 className="mt-4 font-serif text-3xl">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-16 grid gap-8 border border-pine/10 bg-cream p-8 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl">{t.takeoverTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{t.takeoverText}</p>
            </div>
            <div className="text-sm leading-8">
              <p className="font-medium">{site.name}</p>
              <p>
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city}
              </p>
              <p>
                Tel.{" "}
                <a className="text-oxblood" href={site.phone.href}>
                  {site.phone.display}
                </a>
                <br />
                Fax {site.fax.display}
                <br />
                <a className="text-oxblood" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
