import Link from "next/link";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/Wordmark";

export function SiteFooter() {
  return (
    <footer className="bg-pine-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3 lg:px-8">
        <div>
          <Wordmark light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">
            {site.claim}. Seit {site.founded} in Untermarkersdorf.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 border border-gold/30 px-3 py-1 text-[0.65rem] tracking-[0.2em] uppercase text-gold">
            {site.vetMark} · kontrolliert
          </p>
        </div>
        <div>
          <p className="font-serif text-xl text-gold-soft">Besuch & Anfrage</p>
          <address className="mt-4 not-italic text-sm leading-7 text-cream/75">
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
            <br />
            {site.address.region}
          </address>
          <p className="mt-4 text-sm leading-7">
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
        </div>
        <div>
          <p className="font-serif text-xl text-gold-soft">Seiten</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/75">
            <li>
              <Link className="hover:text-gold" href="/sortiment">
                Sortiment
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href="/aktuell">
                Wildübernahme
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href="/kontakt">
                Kontakt
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href="/impressum">
                Impressum
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href="/datenschutz">
                Datenschutz
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-cream/50 sm:flex-row sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>
            {site.legal.fn} · {site.legal.uid}
          </p>
        </div>
      </div>
    </footer>
  );
}
