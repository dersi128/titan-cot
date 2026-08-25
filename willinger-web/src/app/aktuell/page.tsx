import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aktuell",
  description:
    "Wildübernahme und Verkauf in Untermarkersdorf. Kontakt für Jäger, Gastronomie und Fachhandel.",
};

const steps = [
  {
    title: "Annahme",
    text: "Wir übernehmen Wild in Untermarkersdorf – nach Absprache, mit klaren Hygiene- und Kühlvorgaben.",
  },
  {
    title: "Zerlegung",
    text: "Fachgerechte Zerwirkung durch den Zerlegebetrieb. Stücke, wie Küche und Handel sie brauchen.",
  },
  {
    title: "Verkauf",
    text: "Frischware und Spezialitäten für Gastronomie, Fachhandel und Abholung vor Ort.",
  },
];

export default function AktuellPage() {
  return (
    <>
      <PageHero
        kicker="Aktuell"
        title="Wildübernahme und Verkauf"
        lead="Imbiss in Hadres, Wochenkarte und Wildübernahme in Untermarkersdorf – der Betrieb für Wildschwein, Hirsch, Reh, Hase, Fasan und Ente."
        image="/images/woods.jpg"
      />
      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="border-t border-gold pt-6">
                <p className="font-serif text-4xl text-gold">0{index + 1}</p>
                <h2 className="mt-4 font-serif text-3xl">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-16 grid gap-8 border border-pine/10 bg-cream p-8 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl">Kontakt für Übernahme</h2>
              <p className="mt-4 leading-7 text-muted">
                Termine bitte telefonisch oder per E-Mail abstimmen. Für Jäger
                und Lieferanten gilt: gekühlt, dokumentiert, veterinärrechtlich
                sauber.
              </p>
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
