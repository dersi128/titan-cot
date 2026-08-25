import Image from "next/image";

export function PageHero({
  kicker,
  title,
  lead,
  image,
}: {
  kicker: string;
  title: string;
  lead?: string;
  image: string;
}) {
  return (
    <section className="relative isolate min-h-[46vh] overflow-hidden bg-pine-deep pt-28 text-cream">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="object-cover opacity-40"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-pine-deep via-pine-deep/70 to-pine/40" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <p className="text-[0.7rem] tracking-[0.38em] uppercase text-gold">
          {kicker}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] sm:text-6xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/80">
            {lead}
          </p>
        )}
        <div className="mt-8 h-px w-24 bg-gold" />
      </div>
    </section>
  );
}
