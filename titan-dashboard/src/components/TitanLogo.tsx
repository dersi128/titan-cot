import { useId } from "react";

type TitanLogoProps = {
  className?: string;
  title?: string;
};

export function TitanLogo({ className, title = "TITAN" }: TitanLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `titan-grad-${uid}`;
  const glowId = `titan-glow-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      width={56}
      height={56}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcee0a" />
          <stop offset="45%" stopColor="#ff006e" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M28 3 L51 15.5 V40.5 L28 53 L5 40.5 V15.5 Z"
        fill="rgba(12,6,18,0.94)"
        stroke={`url(#${gradId})`}
        strokeWidth="1.25"
        filter={`url(#${glowId})`}
      />
      <path
        d="M12 12 H20 M36 12 H44 M12 44 H20 M36 44 H44"
        stroke={`url(#${gradId})`}
        strokeWidth="1"
        strokeLinecap="square"
        opacity={0.85}
      />
      <path
        d="M17 20 H39 M28 20 V38"
        stroke={`url(#${gradId})`}
        strokeWidth="3.2"
        strokeLinecap="square"
        filter={`url(#${glowId})`}
      />
      <circle cx="28" cy="41" r="2" fill="#fcee0a" opacity={0.95} />
    </svg>
  );
}
