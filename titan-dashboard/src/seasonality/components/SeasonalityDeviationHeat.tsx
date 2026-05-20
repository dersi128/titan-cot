import { ReferenceArea } from "recharts";
import type { SeasonalDeviationMonthlyHeat } from "../utils/seasonalDeviationEngine";
import { MONTHS } from "../utils/chartData";

const HEAT_FILL: Record<SeasonalDeviationMonthlyHeat["level"], string> = {
  LOW: "rgba(212, 175, 55, 0.04)",
  MODERATE: "rgba(212, 175, 55, 0.09)",
  HIGH: "rgba(196, 92, 122, 0.14)",
  EXTREME: "rgba(196, 92, 122, 0.22)",
};

type SeasonalityDeviationHeatProps = {
  heat: SeasonalDeviationMonthlyHeat[];
  throughMonth: number;
};

export function SeasonalityDeviationHeat({ heat, throughMonth }: SeasonalityDeviationHeatProps) {
  return (
    <>
      {heat
        .filter((h) => h.month <= throughMonth && h.avgDistance > 0)
        .map((h) => {
          const x1Index = h.month === 12 ? 10 : h.month - 1;
          const x2Index = h.month === 12 ? 11 : h.month;
          return (
          <ReferenceArea
            key={`dev-heat-${h.month}`}
            x1={MONTHS[x1Index]}
            x2={MONTHS[x2Index]}
            fill={HEAT_FILL[h.level]}
            fillOpacity={1}
            strokeOpacity={0}
            ifOverflow="visible"
          />
          );
        })}
    </>
  );
}
