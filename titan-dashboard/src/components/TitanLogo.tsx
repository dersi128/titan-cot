import { useId, useState } from "react";
import { useTitanI18n } from "../i18n";
import { TITAN_LOGO_SRC } from "../lib/brandAssets";

type TitanLogoProps = {
  className?: string;
  title?: string;
  showWordmark?: boolean;
  /** Show "COT INTELLIGENCE" under the image (off when PNG already includes branding) */
  showTagline?: boolean;
};

function TitanLogoSvg({ className, title, showWordmark }: TitanLogoProps) {
  const { t } = useTitanI18n();
  const uid = useId().replace(/:/g, "");
  const gold = `titan-gold-${uid}`;
  const goldDeep = `titan-gold-deep-${uid}`;
  const glow = `titan-glow-${uid}`;

  const icon = (
    <svg
      className={showWordmark ? `h-14 w-14 shrink-0 drop-shadow-glow ${className ?? ""}` : className}
      viewBox="0 0 72 80"
      width={72}
      height={80}
      role="img"
      aria-label={showWordmark ? undefined : title}
    >
      <defs>
        <linearGradient id={gold} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff4c4" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#6b5520" />
        </linearGradient>
        <linearGradient id={goldDeep} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1a1a22" />
          <stop offset="100%" stopColor="#050508" />
        </linearGradient>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M20 14 L26 22 L32 12 L36 20 L40 12 L46 22 L52 14 L48 26 L24 26 Z"
        fill={`url(#${gold})`}
        opacity="0.95"
        filter={`url(#${glow})`}
      />
      <path
        d="M36 28 L58 38 V54 C58 64 48 72 36 76 C24 72 14 64 14 54 V38 Z"
        fill={`url(#${goldDeep})`}
        stroke={`url(#${gold})`}
        strokeWidth="2"
        filter={`url(#${glow})`}
      />
      <path d="M28 42 H44 V46 H38 V62 H34 V46 H28 V42 Z" fill={`url(#${gold})`} />
    </svg>
  );

  if (!showWordmark) return icon;

  return (
    <div className={`flex items-center gap-4 ${className ?? ""}`}>
      {icon}
      <div className="min-w-0 leading-none">
        <p className="font-display text-sm font-bold uppercase tracking-[0.42em] text-titan-goldBright">TITAN</p>
        <p className="mt-1 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-titan-muted">
          {t("brand.tagline")}
        </p>
      </div>
    </div>
  );
}

export function TitanLogo({
  className,
  title = "TITAN COT",
  showWordmark = false,
  showTagline = false,
}: TitanLogoProps) {
  const { t } = useTitanI18n();
  const [imgFailed, setImgFailed] = useState(false);

  if (!TITAN_LOGO_SRC || imgFailed) {
    return <TitanLogoSvg className={className} title={title} showWordmark={showWordmark} />;
  }

  const image = (
    <img
      src={TITAN_LOGO_SRC}
      alt={title}
      width={480}
      height={112}
      className={`titan-brand-logo ${className ?? ""}`}
      decoding="async"
      fetchPriority="high"
      onError={() => setImgFailed(true)}
    />
  );

  if (!showWordmark) {
    return image;
  }

  return (
    <div className={className}>
      {image}
      {showTagline ? (
        <p className="mt-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-titan-muted">
          {t("brand.tagline")}
        </p>
      ) : null}
    </div>
  );
}
