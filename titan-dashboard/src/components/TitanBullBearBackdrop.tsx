import { useId } from "react";

/** Full-viewport bull vs bear battle — decorative, low opacity behind UI. */
export function TitanBullBearBackdrop() {
  const uid = useId().replace(/:/g, "");
  const bullGrad = `bull-${uid}`;
  const bearGrad = `bear-${uid}`;
  const goldGrad = `gold-${uid}`;
  const clashGrad = `clash-${uid}`;

  return (
    <div className="titan-bull-bear-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="titan-bull-bear-backdrop__art"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={bullGrad} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#1a3d2e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={bearGrad} x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#3d1518" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id={clashGrad} cx="50%" cy="48%" r="35%">
            <stop offset="0%" stopColor="#f0d060" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#d4af37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#020203" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={goldGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d060" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a7844" />
          </linearGradient>
          <filter id={`blur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#clashGrad)" />
        <ellipse cx="720" cy="430" rx="280" ry="120" fill="url(#clashGrad)" opacity="0.6" />

        {/* Dust / arena floor */}
        <path
          d="M0 620 Q360 580 720 600 T1440 640 V900 H0 Z"
          fill="#0a0a0e"
          opacity="0.85"
        />
        <path
          d="M0 650 Q400 610 720 635 T1440 680 V900 H0 Z"
          fill="url(#goldGrad)"
          opacity="0.04"
        />

        {/* Bull — left, charging right */}
        <g transform="translate(80 200) scale(1.05)" fill={`url(#${bullGrad})`} opacity="0.92">
          <path
            d="M420 380c-40-120-200-200-340-160-30 80 20 200 120 280 40 35 90 55 140 60 25-70 50-130 80-180z"
            opacity="0.5"
          />
          <path d="M200 420c-90-30-160 40-180 130 25 15 55 22 85 20 15-55 55-110 95-150z" />
          <path d="M280 320c-20-90 60-170 150-200 30 70-10 150-70 200-50 35-110 50-80 0z" />
          <path
            d="M340 260c80-40 180-20 240 50 15 90-40 170-120 210-70 30-150 10-200-60 20-50 55-140 80-200z"
            stroke={`url(#${goldGrad})`}
            strokeWidth="2"
            fill="none"
            opacity="0.35"
          />
          {/* Horns */}
          <path
            d="M120 200c-30-50 10-110 70-120 25 45 15 95-20 120M90 185c-45-35-50-95-5-130"
            stroke="#f0d060"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M160 195c-15-55 35-100 90-95-10 40-35 75-70 95"
            fill="#34d399"
            opacity="0.25"
          />
          {/* Head */}
          <ellipse cx="95" cy="250" rx="75" ry="55" />
          <path d="M40 255c25 25 55 35 90 30-5-25-25-45-55-55-20 5-35 15-35 25z" opacity="0.7" />
          <circle cx="55" cy="235" r="6" fill="#f0d060" opacity="0.7" />
        </g>

        {/* Bear — right, lunging left */}
        <g transform="translate(820 180) scale(1.05)" fill={`url(#${bearGrad})`} opacity="0.92">
          <path d="M80 400c100-80 260-60 320 60 10 100-60 180-150 220-60 25-130 15-170-80z" opacity="0.5" />
          <path d="M200 430c70-20 130 50 120 140-30 10-65 12-95 5-10-60-15-115-25-145z" />
          <path d="M260 300c50-80 170-100 250-30 5 85-55 160-130 195-55 25-115 15-120-45 5-40 25-95 0-120z" />
          <path
            d="M180 270c-60-50-150-40-210 30-25 85 15 175 95 215 65 30 140 15 185-50-15-55-45-130-70-195z"
            stroke="#fb7185"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          {/* Claws */}
          <path
            d="M340 320l45-35 20 25-40 30M355 350l50-20 15 28-48 22M365 385l55-5 8 32-58 8"
            stroke="#fda4af"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <ellipse cx="300" cy="255" rx="80" ry="58" />
          <path d="M355 260c-30 20-65 28-100 22 8-28 35-48 68-58 18 8 32 22 32 36z" opacity="0.65" />
          <circle cx="335" cy="238" r="6" fill="#fda4af" opacity="0.75" />
        </g>

        {/* Clash sparks */}
        <g transform="translate(720 380)" filter={`url(#blur-${uid})`} opacity="0.85">
          <circle r="8" fill="#f0d060" opacity="0.9" />
          <path
            d="M0-90 L4-40 M0 90 L-4 40 M-90 0 L-40 4 M90 0 L40-4 M-64-64 L-30-30 M64 64 L30 30 M64-64 L30-30 M-64 64 L-30 30"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* Gold ring frame */}
        <ellipse
          cx="720"
          cy="420"
          rx="520"
          ry="280"
          fill="none"
          stroke={`url(#${goldGrad})`}
          strokeWidth="1"
          opacity="0.12"
        />
      </svg>
      <div className="titan-bull-bear-backdrop__veil" />
      <div className="titan-bull-bear-backdrop__grain" />
    </div>
  );
}
