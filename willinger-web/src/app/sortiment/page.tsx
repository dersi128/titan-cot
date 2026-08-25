import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { game, specialties } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sortiment",
  description:
    "Frischwild von Hirsch, Reh, Hase, Fasan und mehr – plus Wildwürste, Gulasch, Pasteten und geräucherter Schinken.",
};

export default function SortimentPage() {
  return (
    <>
      <PageHero
        kicker="Eigene Verarbeitung"
        title="Wild vom Stück bis zur Spezialität"
        lead="Frischwild, Wurstwaren und Geräuchertes aus der eigenen Verarbeitung. Gerne erstellen wir ein passendes Angebot."
        image="/images/fresh-meat.jpg"
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 className="font-serif text-4xl">Frischwild</h2>
          <p className="mt-4 max-w-2xl text-muted leading-7">
            Hirsch, Reh, Feldhase, Fasan, Rebhuhn, Wildkaninchen, Gemse, Mufflon
            und Wildschwein – fachgerecht zerwirkt, kühl gehalten, klar
            deklariert.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {game.map((item) => (
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
          <h2 className="font-serif text-4xl">Wildspezialitäten</h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {specialties.map((item) => (
              <article key={item.name} className="grid overflow-hidden bg-ivory sm:grid-cols-2">
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
            href="/kontakt"
            className="mt-12 inline-block bg-oxblood px-7 py-3 text-[0.72rem] tracking-[0.24em] uppercase text-cream"
          >
            Angebot einholen
          </Link>
        </div>
      </section>
    </>
  );
}
