/** Simplified circular flag marks — broker-terminal style. */
import { useId, type ReactNode } from "react";

export type FlagProps = { className?: string };

function CircleClip({ children }: { children: ReactNode }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `flag-${uid}`;
  return (
    <svg className="h-full w-full" viewBox="0 0 64 64" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
    </svg>
  );
}

export function FlagEu({ className }: FlagProps) {
  const stars: Array<[number, number]> = [
    [32, 12],
    [40.5, 14.8],
    [46.8, 21.5],
    [48.5, 30],
    [46.8, 38.5],
    [40.5, 45.2],
    [32, 48],
    [23.5, 45.2],
    [17.2, 38.5],
    [15.5, 30],
    [17.2, 21.5],
    [23.5, 14.8],
  ];
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#002395" />
        {stars.map(([cx, cy], i) => (
          <path
            key={i}
            d={`M${cx} ${cy - 2.4}l.7 2h2.1l-1.7 1.25.65 2-1.75-1.2-1.75 1.2.65-2-1.7-1.25h2.1z`}
            fill="#FFCC00"
          />
        ))}
      </CircleClip>
    </span>
  );
}

export function FlagUs({ className }: FlagProps) {
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#B22234" />
        {[8, 16, 24, 32, 40, 48, 56].map((y) => (
          <rect key={y} y={y} width="64" height="4" fill="#fff" />
        ))}
        <rect width="28" height="28" fill="#3C3B6E" />
        {[6, 14, 22].flatMap((x) =>
          [6, 12, 18, 24].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.35" fill="#fff" />),
        )}
      </CircleClip>
    </span>
  );
}

export function FlagJp({ className }: FlagProps) {
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#fff" />
        <circle cx="32" cy="32" r="13.5" fill="#BC002D" />
      </CircleClip>
    </span>
  );
}

export function FlagGb({ className }: FlagProps) {
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#012169" />
        <path d="M0 0l64 64M64 0L0 64" stroke="#fff" strokeWidth="10" />
        <path d="M0 0l64 64M64 0L0 64" stroke="#C8102E" strokeWidth="4" />
        <path d="M32 0v64M0 32h64" stroke="#fff" strokeWidth="14" />
        <path d="M32 0v64M0 32h64" stroke="#C8102E" strokeWidth="8" />
      </CircleClip>
    </span>
  );
}

export function FlagAu({ className }: FlagProps) {
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#00008B" />
        <rect width="28" height="20" fill="#012169" />
        <path d="M0 0l28 20M28 0L0 20" stroke="#fff" strokeWidth="3.5" />
        <path d="M0 0l28 20M28 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
        <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="5" />
        <path d="M14 0v20M0 10h28" stroke="#C8102E" strokeWidth="2.5" />
        <circle cx="42" cy="36" r="2.3" fill="#fff" />
        <circle cx="50" cy="26" r="1.6" fill="#fff" />
        <circle cx="54" cy="40" r="1.4" fill="#fff" />
        <circle cx="36" cy="46" r="1.5" fill="#fff" />
        <circle cx="46" cy="48" r="1.2" fill="#fff" />
      </CircleClip>
    </span>
  );
}

export function FlagCa({ className }: FlagProps) {
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#fff" />
        <rect width="15" height="64" fill="#FF0000" />
        <rect x="49" width="15" height="64" fill="#FF0000" />
        <path
          d="M32 15l2.4 5.4 5.6-1.3-2.4 5.2 4.8 3.2-5.6.7.4 5.6-5.2-2.8-5.2 2.8.4-5.6-5.6-.7 4.8-3.2-2.4-5.2 5.6 1.3L32 15z"
          fill="#FF0000"
        />
        <path d="M32 39v10" stroke="#FF0000" strokeWidth="2.4" strokeLinecap="round" />
      </CircleClip>
    </span>
  );
}

export function FlagCh({ className }: FlagProps) {
  return (
    <span className={className}>
      <CircleClip>
        <rect width="64" height="64" fill="#D52B1E" />
        <rect x="26" y="14" width="12" height="36" rx="1" fill="#fff" />
        <rect x="14" y="26" width="36" height="12" rx="1" fill="#fff" />
      </CircleClip>
    </span>
  );
}
