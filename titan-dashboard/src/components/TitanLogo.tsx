import { useId } from "react";
import { useTitanI18n } from "../i18n";

type TitanLogoProps = {
  className?: string;
  title?: string;
  /** Show wordmark beside icon (header lockup). */
  showWordmark?: boolean;
};

export function TitanLogo({ className, title = "TITAN COT", showWordmark = false }: TitanLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gold = `titan-gold-${uid}`;
  const bull = `titan-bull-${uid}`;
  const bear = `titan-bear-${uid}`;
  const glow = `titan-glow-${uid}`;

  const icon = (
    <svg
      className={showWordmark ? `h-12 w-12 shrink-0 ${className ?? ""}` : className}
      viewBox="0 0 64 64"
      width={64}
      height={64}
      role="img"
      aria-label={showWordmark ? undefined : title}
    >
      <defs>
        <linearGradient id={gold} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6a8" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#6b5a2e" />
        </linearGradient>
        <linearGradient id={bull} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id={bear} x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="#08080c"
        stroke={`url(#${gold})`}
        strokeWidth="1.5"
        filter={`url(#${glow})`}
      />
      <circle cx="32" cy="32" r="25.5" fill="none" stroke={`url(#${gold})`} strokeWidth="0.5" opacity="0.35" />

      {/* Split arena */}
      <path d="M32 8 L32 56" stroke={`url(#${gold})`} strokeWidth="0.75" opacity="0.25" />
      <path d="M8 32 L56 32" stroke={`url(#${gold})`} strokeWidth="0.5" opacity="0.12" />

      {/* Bull silhouette — left */}
      <g fill={`url(#${bull})`} opacity="0.95">
        <path d="M10 38c8-14 22-22 38-20 6 10 4 24-6 32-8 6-18 8-26 4 2-6-2-12-6-16z" />
        <path d="M14 28c-2-10 8-18 18-20 4 8 2 18-4 24-6-4-10-2-14-4z" />
        <path
          d="M8 26c-4-6 0-14 8-16 3 5 2 11-2 16"
          stroke="#f0d060"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="16" cy="30" r="1.5" fill="#f0d060" />
      </g>

      {/* Bear silhouette — right */}
      <g fill={`url(#${bear})`} opacity="0.95">
        <path d="M54 38c-8-14-22-22-38-20-6 10-4 24 6 32 8 6 18 8 26 4-2-6 2-12 6-16z" />
        <path d="M50 28c2-10-8-18-18-20-4 8-2 18 4 24 6-4 10-2 14-4z" />
        <path
          d="M56 26c4-6 0-14-8-16-3 5-2 11 2 16"
          stroke="#fda4af"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="48" cy="30" r="1.5" fill="#fda4af" />
      </g>

      {/* Center T monogram */}
      <path
        d="M24 22h16v4H30v14h-4V26h-6v-4z"
        fill={`url(#${gold})`}
        filter={`url(#${glow})`}
      />

      {/* Clash diamond */}
      <path
        d="M32 18l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z"
        fill="#f0d060"
        opacity="0.85"
      />
    </svg>
  );

  if (!showWordmark) {
    return icon;
  }

  return (
    <div className={`flex items-center gap-3.5 ${className ?? ""}`}>
      {icon}
      <div className="min-w-0 leading-none">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.38em] text-titan-gold">
          TITAN
        </p>
        <p className="mt-0.5 font-display text-sm font-medium tracking-wide text-stone-400">{t("brand.tagline")}</p>
      </div>
    </div>
  );
}
