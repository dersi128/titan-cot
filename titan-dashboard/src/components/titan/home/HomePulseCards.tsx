import { useEffect, useMemo, useState } from "react";
import type { CotDashboardData } from "../../../types";
import type { AppSection, NavigateSectionOptions } from "../../../lib/titanAppRoute";
import { usdPulseFromBundle, type UsdBiasLabel } from "../../../lib/homeUsdPulse";
import {
  scanBestSeasonalityLongs,
  type SeasonalityLongCandidate,
} from "../../../seasonality/utils/scanBestSeasonalityLong";
import { useTitanI18n } from "../../../i18n";
import { TitanScoreRing100 } from "../ui/TitanPrimitives";
import bullArt from "../../../assets/sentiment/bull.png";
import bearArt from "../../../assets/sentiment/bear.png";

type HomePulseCardsProps = {
  bundle: Record<string, CotDashboardData>;
  onNavigate: (section: AppSection, options?: NavigateSectionOptions) => void;
};

function biasTone(bias: string): string {
  if (bias === "BULLISH") return "text-emerald-400";
  if (bias === "BEARISH") return "text-rose-400";
  return "text-amber-300";
}

function UsdBiasMascot({ bias }: { bias: UsdBiasLabel }) {
  if (bias === "NEUTRAL") return null;
  const src = bias === "BULLISH" ? bullArt : bearArt;
  const alt = bias === "BULLISH" ? "Bull" : "Bear";
  return (
    <img
      src={src}
      alt={alt}
      width={160}
      height={120}
      decoding="async"
      className="pointer-events-none h-[4.75rem] w-auto max-w-[7.5rem] shrink-0 object-contain object-right opacity-95 -scale-x-100 sm:h-[5.5rem] sm:max-w-[8.5rem]"
      aria-hidden
    />
  );
}

function SeasonalLongRows({
  rows,
  onOpenMarket,
}: {
  rows: SeasonalityLongCandidate[];
  onOpenMarket: (marketId: string) => void;
}) {
  return (
    <ul className="mt-2.5 space-y-1">
      {rows.map((row, i) => {
        const pct = Math.max(8, Math.min(100, row.score));
        const bar = row.bias === "BULLISH" ? "bg-emerald-400/80" : "bg-sky-400/70";
        const labelTone = row.bias === "BULLISH" ? "text-emerald-300" : "text-sky-200";
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMarket(row.dataSymbol);
              }}
              className="grid w-full grid-cols-[1.1rem_minmax(0,1fr)_2.6rem_2.4rem] items-center gap-x-2 rounded px-1 py-1 text-left transition hover:bg-white/[0.05]"
            >
              <span className="font-mono text-[10px] tabular-nums text-stone-600">{i + 1}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className={`truncate font-display text-[12px] font-semibold tracking-wide ${labelTone}`}>
                    {row.label}
                  </span>
                  <span className="shrink-0 text-[9px] uppercase tracking-wider text-stone-600">
                    {row.strength}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-right font-mono text-[11px] font-semibold tabular-nums text-stone-200">
                {row.score}
              </span>
              <span className="text-right font-mono text-[10px] tabular-nums text-stone-500">
                {row.winRate.toFixed(0)}%
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function HomePulseCards({ bundle, onNavigate }: HomePulseCardsProps) {
  const { t } = useTitanI18n();
  const usd = useMemo(() => usdPulseFromBundle(bundle), [bundle]);

  const [longs, setLongs] = useState<SeasonalityLongCandidate[] | null>(null);
  const [scanDone, setScanDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setScanDone(false);
    void (async () => {
      const ranked = await scanBestSeasonalityLongs();
      if (!cancelled) {
        setLongs(ranked);
        setScanDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const topLongs = longs ?? [];

  return (
    <section
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
      aria-label={t("home.pulseTitle")}
    >
      <button
        type="button"
        onClick={() => onNavigate("dme")}
        className="titan-cmd-card w-full self-stretch text-left transition hover:border-white/15"
      >
        <div className="flex h-full items-center gap-3 p-1 sm:gap-4 sm:p-2">
          <TitanScoreRing100 score={usd.score100} label="USD" />
          <div className="min-w-0 flex-1">
            <p className="titan-cmd-kicker">{t("home.pulseDmeTitle")}</p>
            <p className={`mt-1 font-display text-xl font-semibold tracking-wide ${biasTone(usd.bias)}`}>
              {t(`home.pulseUsdBias.${usd.bias}`)}
            </p>
            <p className="mt-1 text-[12px] text-stone-500">
              {usd.score100 === null
                ? t("home.pulseDmeUnavailable")
                : t("home.pulseDmeSub", { score: String(usd.score100) })}
            </p>
          </div>
          <UsdBiasMascot bias={usd.bias} />
        </div>
      </button>

      <article className="titan-cmd-card w-full self-stretch">
        <div className="flex h-full flex-col p-1 sm:p-2">
          <button
            type="button"
            onClick={() => onNavigate("seasonality")}
            className="flex w-full items-end justify-between gap-2 text-left transition hover:opacity-90"
          >
            <p className="titan-cmd-kicker">{t("home.pulseSeasonTitle")}</p>
            {scanDone && topLongs.length > 0 ? (
              <p className="font-mono text-[9px] uppercase tracking-wider text-stone-600">
                {t("home.pulseSeasonCols")}
              </p>
            ) : null}
          </button>
          {!scanDone ? (
            <p className="mt-3 text-[13px] text-stone-500">{t("home.pulseSeasonLoading")}</p>
          ) : topLongs.length > 0 ? (
            <SeasonalLongRows
              rows={topLongs}
              onOpenMarket={(marketId) =>
                onNavigate("seasonality", { seasonalityMarket: marketId })
              }
            />
          ) : (
            <p className="mt-3 text-[13px] text-stone-500">{t("home.pulseSeasonEmpty")}</p>
          )}
        </div>
      </article>
    </section>
  );
}
