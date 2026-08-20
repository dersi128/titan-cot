import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValuationSnapshot } from "../types";
import { useTitanI18n } from "../../i18n";

function formatPx(n: number): string {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (n >= 20) return n.toFixed(2);
  return n.toFixed(4);
}

export function ValuationChart({ snapshot }: { snapshot: ValuationSnapshot }) {
  const { t } = useTitanI18n();
  const data = useMemo(
    () =>
      snapshot.history.map((p) => ({
        date: p.date.slice(0, 7),
        price: p.price,
        fair: p.fairValue,
      })),
    [snapshot.history],
  );

  if (data.length < 8) {
    return (
      <section className="titan-seasonality-chart px-4 py-6 text-center text-sm text-stone-500">
        {t("valuation.chartEmpty")}
      </section>
    );
  }

  return (
    <section className="titan-seasonality-chart p-4">
      <p className="titan-cmd-kicker mb-3">{t("valuation.chartTitle")}</p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#78716c", fontSize: 10 }} minTickGap={28} />
            <YAxis
              tick={{ fill: "#78716c", fontSize: 10 }}
              tickFormatter={(v: number) => formatPx(v)}
              width={64}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0e16",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [
                formatPx(Number(value)),
                name === "fair" ? t("valuation.fairValue") : t("valuation.spot"),
              ]}
            />
            <Line type="monotone" dataKey="price" stroke="#e7e5e4" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fair" stroke="#2ea8ff" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
