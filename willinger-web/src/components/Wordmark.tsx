export function Wordmark({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  const name = light ? "text-cream" : "text-pine";
  const sub = light ? "text-gold-soft" : "text-moss";

  return (
    <span className="flex items-center gap-3">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-sm border ${
          light ? "border-gold/50 bg-pine-deep" : "border-gold/40 bg-pine"
        }`}
        aria-hidden
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-gold">
          <path d="M8 24V9h4.1c3.4 0 5.6 1.8 5.6 4.7 0 2-.9 3.5-2.8 4.2L19.4 24h-4.1l-4.2-5.2H12V24H8Zm4-8.4v-3.2h.4c1.4 0 2.2.7 2.2 1.7s-.8 1.5-2.2 1.5H12Z" />
          <path
            d="M6 8c2.4-3.6 6.2-5 8.8-5M26 8c-2.4-3.6-6.2-5-8.8-5"
            fill="none"
            stroke="currentColor"
            className="stroke-gold"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={`block font-serif text-[1.35rem] font-semibold tracking-[0.18em] uppercase ${name}`}
        >
          Willinger
        </span>
        {!compact && (
          <span
            className={`mt-1 block text-[0.62rem] tracking-[0.32em] uppercase ${sub}`}
          >
            Wild und Fleisch
          </span>
        )}
      </span>
    </span>
  );
}
