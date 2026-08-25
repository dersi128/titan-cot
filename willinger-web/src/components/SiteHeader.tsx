"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const onHero = pathname === "/";
  const light = onHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 has-[[open]]:border-b has-[[open]]:border-gold/20 has-[[open]]:bg-pine-deep/95 ${
        light
          ? "bg-transparent text-cream"
          : "border-b border-gold/20 bg-pine-deep/95 text-cream backdrop-blur-md"
      }`}
    >
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-pine-deep"
      >
        Zum Inhalt
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" aria-label="Willinger Startseite">
          <Wordmark light compact={false} />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Hauptnavigation">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[0.72rem] tracking-[0.28em] uppercase transition-colors ${
                  active ? "text-gold" : "text-cream/80 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/kontakt"
            className="border border-gold/70 bg-gold/10 px-4 py-2 text-[0.68rem] tracking-[0.22em] uppercase text-gold-soft transition-colors hover:bg-gold hover:text-pine-deep"
          >
            Angebot anfragen
          </Link>
        </nav>
        <details key={pathname} className="relative md:hidden">
          <summary className="flex h-12 cursor-pointer list-none items-center justify-center border border-gold/60 bg-pine-deep/80 px-3 text-[0.68rem] tracking-[0.2em] uppercase text-gold [&::-webkit-details-marker]:hidden">
            Menü
          </summary>
          <nav
            id="mobile-nav"
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-2.5rem))] border border-gold/25 bg-pine-deep px-5 py-5 shadow-2xl"
          >
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-gold/10 py-3 text-sm tracking-[0.22em] uppercase text-cream"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/kontakt"
                className="mt-4 border border-gold px-4 py-3 text-center text-[0.72rem] tracking-[0.22em] uppercase text-gold"
              >
                Angebot anfragen
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
