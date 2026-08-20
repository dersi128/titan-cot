import type { ValuationComponent, ValuationSnapshot } from "../types";
import { useTitanI18n } from "../../i18n";

function scoreTone(score: number): string {
  if (score >= 15) return "text-emerald-400";
  if (score <= -15) return "text-rose-400";
  return "text-stone-300";
}

function formatPx(n: number): string {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (n >= 20) return n.toFixed(2);
  return n.toFixed(5);
}

function formatGap(gap: number | null): string {
  if (gap == null) return "—";
  const sign = gap > 0 ? "+" : "";
  return `${sign}${gap.toFixed(1)}%`;
}

function componentLabel(id: ValuationComponent["id"], t: (k: string) => string): string {
  return t(`valuation.component.${id}`);
}

export function ValuationHero({ snapshot }: { snapshot: ValuationSnapshot }) {
  const { t } = useTitanI18n();
  const mark = `${((snapshot.score + 100) / 2).toFixed(1)}%`;
  const cheap = snapshot.score >= 15;
  const rich = snapshot.score <= -15;

  return (
    <section className="titan-seasonality-panel px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="titan-cmd-kicker">{t("valuation.heroEyebrow")}</p>
          <p className={`mt-1 font-display text-2xl font-semibold tracking-wide sm:text-3xl ${scoreTone(snapshot.score)}`}>
            {t(`valuation.verdict.${snapshot.verdict}`)}
            <span className="ml-2 font-mono text-xl text-stone-400">{snapshot.score}</span>
          </p>
          <p className="mt-1 max-w-xl text-[12px] text-stone-500">
            {snapshot.label} · {t(`valuation.class.${snapshot.assetClass}`)} · {t(`valuation.model.${snapshot.model}`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-6 sm:gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">{t("valuation.spot")}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-stone-100">{formatPx(snapshot.price)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">{t("valuation.fairValue")}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-sky-300">
              {snapshot.fairValue != null ? formatPx(snapshot.fairValue) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">{t("valuation.gap")}</p>
            <p className={`mt-1 font-mono text-xl font-semibold ${snapshot.gapPct != null && snapshot.gapPct > 0 ? "text-rose-400" : snapshot.gapPct != null && snapshot.gapPct < 0 ? "text-emerald-400" : "text-stone-300"}`}>
              {formatGap(snapshot.gapPct)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">{t("valuation.confidence")}</p>
            <p className="mt-1 text-xl font-semibold uppercase text-stone-200">
              {t(`valuation.confidenceLevel.${snapshot.confidence}`)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="titan-valuation-meter" aria-hidden>
          <span className="titan-valuation-meter__mark" style={{ left: mark }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-stone-600">
          <span>{t("valuation.rich")}</span>
          <span>0</span>
          <span>{t("valuation.cheap")}</span>
        </div>
        <p className="mt-2 text-[12px] text-stone-500">
          {cheap ? t("valuation.hintCheap") : rich ? t("valuation.hintRich") : t("valuation.hintFair")}
        </p>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.components.map((c) => (
          <li
            key={c.id}
            className={`rounded-lg border px-3 py-2 ${c.available ? "border-white/[0.06] bg-black/20" : "border-white/[0.03] bg-black/10 opacity-50"}`}
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-600">{componentLabel(c.id, t)}</p>
            <p className={`mt-1 font-mono text-lg font-semibold ${c.available ? scoreTone(c.score) : "text-stone-600"}`}>
              {c.available ? c.score : "—"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
