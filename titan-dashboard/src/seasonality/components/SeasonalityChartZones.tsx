import { Label, ReferenceArea } from "recharts";

export type SeasonalityWindowBand = {
  x1: string;
  x2: string;
  bias: "bullish" | "bearish";
};

type SeasonalityChartZonesProps = {
  bands: SeasonalityWindowBand[];
  bullLabel: string;
  bearLabel: string;
};

const ZONE_FILL = {
  bullish: "url(#seasonalityBullZone)",
  bearish: "url(#seasonalityBearZone)",
} as const;

const ZONE_STROKE = {
  bullish: "rgba(61, 184, 140, 0.55)",
  bearish: "rgba(196, 92, 122, 0.55)",
} as const;

const ZONE_LABEL_FILL = {
  bullish: "rgba(61, 184, 140, 0.52)",
  bearish: "rgba(196, 92, 122, 0.52)",
} as const;

export function SeasonalityChartZoneDefs() {
  return (
    <defs>
      <linearGradient id="seasonalityBullZone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3db88c" stopOpacity={0.4} />
        <stop offset="50%" stopColor="#2d8f6e" stopOpacity={0.26} />
        <stop offset="100%" stopColor="#1a4d3c" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="seasonalityBearZone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c45c7a" stopOpacity={0.38} />
        <stop offset="50%" stopColor="#9e4562" stopOpacity={0.24} />
        <stop offset="100%" stopColor="#5c2d3d" stopOpacity={0.1} />
      </linearGradient>
      <filter id="seasonalityBullGlow" x="-8%" y="-12%" width="116%" height="124%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="seasonalityBearGlow" x="-8%" y="-12%" width="116%" height="124%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export function SeasonalityChartZones({ bands, bullLabel, bearLabel }: SeasonalityChartZonesProps) {
  return (
    <>
      {bands.map((band, i) => {
        const isBull = band.bias === "bullish";
        const glowFilter = isBull ? "url(#seasonalityBullGlow)" : "url(#seasonalityBearGlow)";
        const label = isBull ? bullLabel : bearLabel;
        return (
          <ReferenceArea
            key={`${band.bias}-glow-${i}`}
            x1={band.x1}
            x2={band.x2}
            fill={ZONE_FILL[band.bias]}
            fillOpacity={1}
            stroke={ZONE_STROKE[band.bias]}
            strokeWidth={9}
            strokeOpacity={0.16}
            ifOverflow="visible"
            filter={glowFilter}
          />
        );
      })}
      {bands.map((band, i) => {
        const isBull = band.bias === "bullish";
        const label = isBull ? bullLabel : bearLabel;
        return (
          <ReferenceArea
            key={`${band.bias}-zone-${i}`}
            x1={band.x1}
            x2={band.x2}
            fill={ZONE_FILL[band.bias]}
            fillOpacity={1}
            stroke={ZONE_STROKE[band.bias]}
            strokeWidth={1.25}
            strokeOpacity={0.9}
            ifOverflow="visible"
          >
            <Label
              value={label}
              position="insideTopLeft"
              offset={10}
              fill={ZONE_LABEL_FILL[band.bias]}
              fontSize={8}
              fontWeight={600}
              style={{
                fontFamily: "var(--font-display, Cinzel, serif)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            />
          </ReferenceArea>
        );
      })}
    </>
  );
}
