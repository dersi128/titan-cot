"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = onHero && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
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
        <button
          type="button"
          className="relative z-50 grid h-11 w-11 place-items-center border border-gold/40 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span
              className={`absolute left-0 top-0 block h-px w-5 bg-gold transition-transform ${
                open ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] block h-px w-5 bg-gold transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] block h-px w-5 bg-gold transition-transform ${
                open ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-gold/25 bg-pine-deep px-5 py-8 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-gold/10 py-3 text-sm tracking-[0.22em] uppercase text-cream"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/kontakt"
              onClick={() => setOpen(false)}
              className="mt-4 border border-gold px-4 py-3 text-center text-[0.72rem] tracking-[0.22em] uppercase text-gold"
            >
              Angebot anfragen
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
