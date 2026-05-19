/** Premium institutional glyphs — 24×24, stroke-first, gold via currentColor */
export type GlyphProps = { className?: string };

const S = {
  stroke: "currentColor",
  strokeWidth: 1.35,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

export function GlyphDxy({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" {...S} opacity="0.5" />
      <path d="M12 7v10M9.5 10h3a1.8 1.8 0 100-3.6H9.5" {...S} />
    </svg>
  );
}

export function GlyphEur({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 10h7M8 14h5.5M15 8.5a4.5 4.5 0 110 7" {...S} />
    </svg>
  );
}

export function GlyphJpy({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8.5 8.5h7v2.8H8.5V8.5zm0 4.2h7v2.8h-7v-2.8z" {...S} />
    </svg>
  );
}

export function GlyphGbp({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 7v10M10 7h4.2l-2.1 3.5 2.1 3.5H10" {...S} />
    </svg>
  );
}

export function GlyphAud({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7.5 16l2.8-7.5 2.7 7.5M8.8 13.2h3.9" {...S} />
      <path d="M16 9v6M14.5 10.5h3" {...S} opacity="0.7" />
    </svg>
  );
}

export function GlyphCad({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 6v12M9 9l3-3 3 3M9 15l3 3 3-3" {...S} />
    </svg>
  );
}

export function GlyphChf({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" {...S} />
      <path d="M6.5 10.5h2m7 0h2m-5.5-2v2m0 5v2" {...S} />
    </svg>
  );
}

export function GlyphGold({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17h10l-1.8-9H8.8L7 17z" {...S} />
      <path d="M9 8h6" {...S} />
      <path d="M12 5.5l.8 2.2h2.3l-1.9 1.4.7 2.2-2-1.4-2 1.4.7-2.2-1.9-1.4h2.3L12 5.5z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function GlyphSilver({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="2" {...S} />
      <path d="M9.5 12h5M12 9.5v5" {...S} opacity="0.65" />
    </svg>
  );
}

export function GlyphCopper({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="14.5" rx="5.5" ry="2.5" {...S} />
      <path d="M9 11.5l3-5 3 5" {...S} />
      <path d="M12 6.5v2" {...S} />
    </svg>
  );
}

export function GlyphPlatinum({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 16l4-9 4 9" {...S} />
      <path d="M9.2 13.5h5.6" {...S} />
    </svg>
  );
}

export function GlyphPalladium({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.5" {...S} />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" {...S} opacity="0.55" />
    </svg>
  );
}

export function GlyphOil({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5.5c-1.8 3.2-5.5 4.8-5.5 8.2a5.5 5.5 0 1011 0c0-3.4-3.7-5-5.5-8.2z"
        {...S}
      />
      <path d="M12 14.2v2.5" {...S} opacity="0.5" />
    </svg>
  );
}

export function GlyphGas({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5c2.5 2.5 4.5 4.8 4.5 7.5a4.5 4.5 0 11-9 0C7.5 9.8 9.5 7.5 12 5z" {...S} />
    </svg>
  );
}

export function GlyphCorn({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14" {...S} />
      <path d="M9 8c1.5-1.2 3-1.2 3 0s1.5 1.2 3 0M9 16c1.5 1.2 3 1.2 3 0s1.5-1.2 3 0" {...S} />
    </svg>
  );
}

export function GlyphSoy({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10" cy="12" r="2.2" {...S} />
      <circle cx="14.5" cy="10" r="2" {...S} />
      <circle cx="14" cy="14.5" r="2" {...S} />
      <path d="M12 6v2M12 16v2" {...S} opacity="0.45" />
    </svg>
  );
}

export function GlyphWheat({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 6v12" {...S} />
      <path d="M9.5 9.5c2-2 5-2 5 0M9.5 14.5c2 2 5 2 5 0" {...S} />
      <path d="M8 7.5l4-1.5 4 1.5" {...S} opacity="0.5" />
    </svg>
  );
}

export function GlyphCoffee({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="14" rx="4.2" ry="1.4" {...S} opacity="0.45" />
      <path d="M9.5 9.5c.8-2 2.2-3 2.5-3s1.7 1 2.5 3" {...S} />
      <path d="M8.2 10.2c1.2-.6 2.4-.9 3.8-.9s2.6.3 3.8.9" {...S} opacity="0.7" />
      <circle cx="10.5" cy="11.8" r="1.1" fill="currentColor" opacity="0.35" />
      <circle cx="13.8" cy="12.4" r="1" fill="currentColor" opacity="0.35" />
      <circle cx="12" cy="13.6" r="0.95" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function GlyphCocoa({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9.5 14.5c0-3.5 1.5-6.5 2.5-6.5s2.5 3 2.5 6.5" {...S} />
      <path d="M8 14.5h7" {...S} />
      <ellipse cx="12" cy="15.5" rx="3.5" ry="1.2" {...S} opacity="0.55" />
    </svg>
  );
}

export function GlyphSugar({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 15l2-7 2 7M14 15l2-7 2 7" {...S} />
      <path d="M7.5 15h9" {...S} />
    </svg>
  );
}

export function GlyphCotton({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10" cy="11" r="3" {...S} />
      <circle cx="14.5" cy="13" r="2.5" {...S} />
      <path d="M12 6v1.5M12 16.5V18" {...S} opacity="0.45" />
    </svg>
  );
}

export function GlyphCattle({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7.5 14.5c0-3 2.2-5.5 4.5-5.5s4.5 2.5 4.5 5.5v2H7.5v-2z" {...S} />
      <path d="M9.5 8.5V7M14.5 8.5V7" {...S} />
    </svg>
  );
}

export function GlyphHogs({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="13" rx="5" ry="3.5" {...S} />
      <circle cx="9.5" cy="11" r="1" {...S} />
      <circle cx="14.5" cy="11" r="1" {...S} />
      <path d="M12 9.5c0-1.5.8-2.5 0-3.5" {...S} opacity="0.55" />
    </svg>
  );
}

export function GlyphNas100({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 17V12M10 17V9M14 17V11M18 17V7" {...S} />
      <path d="M5 17h14" {...S} opacity="0.45" />
    </svg>
  );
}

export function GlyphSp500({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 17l4-9 3 5 2-3 3 7" {...S} />
      <path d="M5 17h14" {...S} opacity="0.45" />
    </svg>
  );
}

export function GlyphDow({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 17V10h3v7M14 17V7h3v10" {...S} />
      <path d="M5 17h14" {...S} opacity="0.45" />
    </svg>
  );
}

export function GlyphRussell({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 17V13M9 17V10M12 17V14M15 17V9M18 17V11" {...S} />
      <path d="M5 17h14" {...S} opacity="0.45" />
    </svg>
  );
}

/** Bond-style yield curve (for future US02Y / US10Y markets) */
export function GlyphBond({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 16c2-4 4-5 6-7s4-3 6-5" {...S} />
      <circle cx="6" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

export function GlyphDefault({ className }: GlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5l1.8 4.2H18l-3.4 2.5 1.3 4-3.7-2.6-3.7 2.6 1.3-4L6 9.2h4.2L12 5z" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="7.5" {...S} opacity="0.7" />
    </svg>
  );
}
