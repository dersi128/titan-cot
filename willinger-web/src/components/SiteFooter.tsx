"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy, localeFromPath, pathFor, site } from "@/lib/site";
import { Wordmark } from "@/components/Wordmark";

export function SiteFooter() {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const t = copy[locale];

  return (
    <footer className="bg-pine-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3 lg:px-8">
        <div>
          <Wordmark light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">
            {t.claim}. {t.since} {site.founded} {t.in}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 border border-gold/30 px-3 py-1 text-[0.65rem] tracking-[0.2em] uppercase text-gold">
            {site.vetMark} · {t.controlled}
          </p>
        </div>
        <div>
          <p className="font-serif text-xl text-gold-soft">{t.visit}</p>
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
          <p className="font-serif text-xl text-gold-soft">{t.pages}</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/75">
            <li>
              <Link className="hover:text-gold" href={pathFor(locale, "/sortiment")}>
                Sortiment
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href={pathFor(locale, "/aktuell")}>
                {locale === "cs" ? "Výkup zvěřiny" : "Wildübernahme"}
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href={pathFor(locale, "/kontakt")}>
                {locale === "cs" ? "Kontakt" : "Kontakt"}
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href={pathFor(locale, "/impressum")}>
                Impressum
              </Link>
            </li>
            <li>
              <Link className="hover:text-gold" href={pathFor(locale, "/datenschutz")}>
                {locale === "cs" ? "Ochrana údajů" : "Datenschutz"}
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
