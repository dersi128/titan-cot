import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { copy, game, pathFor, specialties, type Locale } from "@/lib/site";

export function SortimentView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <PageHero
        kicker={t.sortimentKicker}
        title={t.sortimentTitle}
        lead={t.sortimentLead}
        image="/images/fresh-meat.jpg"
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 className="font-serif text-4xl">{t.fresh}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted">{t.freshLead}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {game[locale].map((item) => (
              <article
                key={item.name}
                className="border border-pine/10 bg-cream px-6 py-8"
              >
                <p className="text-[0.65rem] tracking-[0.22em] uppercase text-oxblood">
                  {item.note}
                </p>
                <h3 className="mt-2 font-serif text-3xl">{item.name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 className="font-serif text-4xl">{t.specs}</h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {specialties[locale].map((item) => (
              <article
                key={item.name}
                className="grid overflow-hidden bg-ivory sm:grid-cols-2"
              >
                <div className="relative min-h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 25vw, 100vw"
                  />
                </div>
                <div className="flex flex-col justify-center p-7">
                  <h3 className="font-serif text-2xl">{item.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          <Link
            href={pathFor(locale, "/kontakt")}
            className="mt-12 inline-block bg-oxblood px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-cream"
          >
            {t.getOffer}
          </Link>
        </div>
      </section>
    </>
  );
}

