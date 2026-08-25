import Image from "next/image";
import Link from "next/link";
import { game, reasons, site, specialties } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-pine-deep text-cream">
        <Image
          src="/images/hero-forest.jpg"
          alt="Waldweg im Morgenlicht"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pine-deep via-pine-deep/80 to-pine-deep/25" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 lg:justify-center lg:px-8">
          <p className="text-[0.72rem] tracking-[0.42em] uppercase text-gold">
            Weinviertel · Seit {site.founded} · {site.vetMark}
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[0.92] sm:text-7xl lg:text-8xl">
            Wild, das man
            <span className="block italic text-gold-soft">schmecken kann.</span>
          </h1>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-cream/80 sm:text-lg">
            {site.name} ist ein österreichischer Betrieb für die Übernahme,
            Zerlegung und den Handel von Wild und Fleisch.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/kontakt"
              className="bg-gold px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-pine-deep hover:bg-gold-soft"
            >
              Angebot anfragen
            </Link>
            <Link
              href="/sortiment"
              className="border border-cream/40 px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-cream hover:border-gold hover:text-gold"
            >
              Sortiment ansehen
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/deer.jpg"
              alt="Hirsch im Abendlicht"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <div>
            <p className="text-[0.7rem] tracking-[0.34em] uppercase text-oxblood">
              Herzlich willkommen
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Handwerk aus Untermarkersdorf
            </h2>
            <div className="mt-6 h-px w-16 bg-gold" />
            <p className="mt-6 text-base leading-8 text-muted">
              Gerne übermitteln wir ein Angebot aus der eigenen Verarbeitung von
              Wildprodukten. Unsere Palette reicht von Frischwild – Hirsch, Reh,
              Feldhase, Fasan, Rebhuhn, Wildkaninchen, Gemse, Mufflon und mehr –
              über Wildgulasch, Würstel, Wurst, Käsewurst, Leberkäse und
              Leberpastete bis zum geräucherten Wildschinken.
            </p>
            <p className="mt-5 text-base leading-8 text-muted">
              Nach traditionellen Rezepten und mit viel Erfahrung werden
              zahlreiche Wildspezialitäten gekocht. Wir freuen uns auf Ihre
              Anfrage.
            </p>
            <Link
              href="/aktuell"
              className="mt-8 inline-block text-[0.72rem] tracking-[0.22em] uppercase text-oxblood hover:text-pine"
            >
              Wildübernahme & Verkauf →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-pine text-cream">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[0.7rem] tracking-[0.34em] uppercase text-gold">
                Frischwild
              </p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                Das Sortiment
              </h2>
            </div>
            <Link
              href="/sortiment"
              className="text-[0.72rem] tracking-[0.22em] uppercase text-gold-soft hover:text-gold"
            >
              Alle Produkte →
            </Link>
          </div>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {game.map((item) => (
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
            Eigene Verarbeitung
          </p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl sm:text-5xl">
            Spezialitäten nach traditionellen Rezepten
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {specialties.map((item) => (
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
            Warum Fachhandel
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Acht Gründe, hier zu kaufen
          </h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((item) => (
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
          alt="Weinviertel"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <p className="text-[0.7rem] tracking-[0.34em] uppercase text-gold">
            {site.address.region}
          </p>
          <h2 className="mt-5 font-serif text-4xl sm:text-6xl">
            Wir freuen uns auf Ihre geschätzte Anfrage.
          </h2>
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
              href="/kontakt"
              className="border border-cream/40 px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase"
            >
              Nachricht schreiben
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
