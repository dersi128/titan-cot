import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHero
        kicker="Rechtliches"
        title="Datenschutz"
        image="/images/woods.jpg"
      />
      <section className="bg-ivory">
        <article className="mx-auto max-w-3xl space-y-5 px-5 py-16 text-sm leading-7 text-muted lg:px-8">
          <p>
            Verantwortliche Stelle: {site.name}, {site.address.street},{" "}
            {site.address.zip} {site.address.city}, {site.email}.
          </p>
          <p>
            Diese Website speichert keine Tracking-Cookies und betreibt keine
            Analyseprofile. Das Kontaktformular öffnet Ihr eigenes
            E-Mail-Programm. Es werden keine Formulardaten auf dem Server
            gespeichert.
          </p>
          <p>
            Wenn Sie uns per Telefon oder E-Mail kontaktieren, verarbeiten wir
            die angegebenen Daten ausschließlich zur Beantwortung Ihrer Anfrage
            und zur Abwicklung von Bestellungen oder Übernahmen.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und f DSGVO. Eine Weitergabe
            an Dritte erfolgt nicht, außer sie ist zur Vertragserfüllung oder
            gesetzlich erforderlich.
          </p>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung, Widerspruch und Datenübertragbarkeit sowie das Recht
            auf Beschwerde bei der österreichischen Datenschutzbehörde.
          </p>
        </article>
      </section>
    </>
  );
}
