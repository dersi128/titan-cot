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
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-gold">
          <path
            d="M6 11c3.2-5.2 7.4-7 10-7M26 11c-3.2-5.2-7.4-7-10-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M7.5 12 12 24.5 16 15.5 20 24.5 24.5 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="miter"
            strokeLinecap="butt"
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
