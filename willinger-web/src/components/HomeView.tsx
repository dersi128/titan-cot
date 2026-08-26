import Image from "next/image";
import Link from "next/link";
import { copy, game, pathFor, reasons, site, specialties, type Locale } from "@/lib/site";

export function HomeView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-pine-deep text-cream">
        <Image
          src="/images/hero-forest.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pine-deep via-pine-deep/80 to-pine-deep/25" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 lg:justify-center lg:px-8">
          <p className="text-[0.72rem] tracking-[0.42em] uppercase text-gold">
            {t.heroKicker}
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[0.92] sm:text-7xl lg:text-8xl">
            {t.heroTitle1}
            <span className="block italic text-gold-soft">{t.heroTitle2}</span>
          </h1>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-cream/80 sm:text-lg">
            {t.heroLead}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={pathFor(locale, "/kontakt")}
              className="bg-gold px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-pine-deep hover:bg-gold-soft"
            >
              {t.offer}
            </Link>
            <Link
              href={pathFor(locale, "/sortiment")}
              className="border border-cream/40 px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-cream hover:border-gold hover:text-gold"
            >
              {t.seeRange}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/deer.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <div>
            <p className="text-[0.7rem] tracking-[0.34em] uppercase text-oxblood">
              {t.welcome}
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              {t.welcomeTitle}
            </h2>
            <div className="mt-6 h-px w-16 bg-gold" />
            <p className="mt-6 text-base leading-8 text-muted">{t.welcomeP1}</p>
            <p className="mt-5 text-base leading-8 text-muted">{t.welcomeP2}</p>
            <Link
              href={pathFor(locale, "/aktuell")}
              className="mt-8 inline-block text-[0.72rem] tracking-[0.22em] uppercase text-oxblood hover:text-pine"
            >
              {t.takeoverLink}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-pine text-cream">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[0.7rem] tracking-[0.34em] uppercase text-gold">
                {t.fresh}
              </p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.range}</h2>
            </div>
            <Link
              href={pathFor(locale, "/sortiment")}
              className="text-[0.72rem] tracking-[0.22em] uppercase text-gold-soft hover:text-gold"
            >
              {t.allProducts}
            </Link>
          </div>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {game[locale].map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between border border-gold/20 px-5 py-4"
              >
                <span className="font-serif text-2xl">{item.name}</span>
                <span className="text-[0.65rem] tracking-[0.2em] uppercase text-gold">
                  {item.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
          <p className="text-[0.7rem] tracking-[0.34em] uppercase text-oxblood">
            {t.own}
          </p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl sm:text-5xl">
            {t.specTitle}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {specialties[locale].map((item) => (
              <article key={item.name} className="group overflow-hidden bg-ivory">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 45vw, 100vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
          <p className="text-[0.7rem] tracking-[0.34em] uppercase text-oxblood">
            {t.why}
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.whyTitle}</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {reasons[locale].map((item) => (
              <li key={item.n} className="border-t border-gold pt-5">
                <p className="font-serif text-3xl text-gold">{item.n}</p>
                <h3 className="mt-3 font-serif text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-pine-deep py-28 text-cream">
        <Image
          src="/images/weinviertel.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <p className="text-[0.7rem] tracking-[0.34em] uppercase text-gold">
            {site.address.region}
          </p>
          <h2 className="mt-5 font-serif text-4xl sm:text-6xl">{t.cta}</h2>
          <p className="mt-6 text-cream/75">
            {site.address.street}, {site.address.zip} {site.address.city}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={site.phone.href}
              className="bg-gold px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-pine-deep"
            >
              {site.phone.display}
            </a>
            <Link
              href={pathFor(locale, "/kontakt")}
              className="border border-cream/40 px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase"
            >
              {t.write}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
