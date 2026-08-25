import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-pine-deep px-5 pt-28 text-center text-cream">
      <p className="text-[0.7rem] tracking-[0.34em] uppercase text-gold">404</p>
      <h1 className="mt-4 font-serif text-5xl">Seite nicht gefunden</h1>
      <Link
        href="/"
        className="mt-8 border border-gold px-6 py-3 text-[0.7rem] tracking-[0.22em] uppercase text-gold"
      >
        Zur Startseite
      </Link>
    </section>
  );
}
