import { useEffect, useMemo, useState } from "react";
import type { CotDashboardData } from "../../../types";
import type { AppSection, NavigateSectionOptions } from "../../../lib/titanAppRoute";
import { usdPulseFromBundle } from "../../../lib/homeUsdPulse";
import {
  scanSeasonalOpportunities,
  currentPresidentialCyclePhase,
  type SeasonalityOpportunity,
} from "../../../seasonality/utils/scanBestSeasonalityLong";
import { useTitanI18n } from "../../../i18n";
import { UsdMacroBanner } from "./UsdMacroBanner";

type HomePulseCardsProps = {
  bundle: Record<string, CotDashboardData>;
  onNavigate: (section: AppSection, options?: NavigateSectionOptions) => void;
};

function OpportunityRows({
  rows,
  windowTag,
  phaseLabels,
  onOpenMarket,
}: {
  rows: SeasonalityOpportunity[];
  windowTag: string;
  phaseLabels: Record<SeasonalityOpportunity["phase"], string>;
  onOpenMarket: (marketId: string) => void;
}) {
  return (
    <ul className="mt-1.5 divide-y divide-white/[0.04]">
      {rows.map((row, i) => {
        const pct = Math.max(6, Math.min(100, row.score));
        const isLong = row.side === "LONG";
        const bar = isLong ? "bg-emerald-400/90" : "bg-rose-400/85";
        const labelTone = isLong ? "text-emerald-300" : "text-rose-300";
        const windowText = row.windowLabel.replace(/\s+/g, " ");
        const phase = phaseLabels[row.phase];
        const timing =
          row.phase === "active"
            ? ""
            : row.daysUntilStart > 0
              ? ` · T-${row.daysUntilStart}`
              : "";
        return (
          <li key={`${row.side}-${row.phase}-${row.id}`}>
            <button
              type="button"
              onClick={() => onOpenMarket(row.dataSymbol)}
              className="grid w-full grid-cols-[0.9rem_minmax(0,1fr)_1.75rem] items-center gap-x-1.5 py-1 text-left transition hover:bg-white/[0.04]"
            >
              <span className="font-mono text-[9px] tabular-nums text-stone-600">{i + 1}</span>
              <div className="min-w-0">
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className={`truncate font-display text-[11px] font-semibold tracking-wide ${labelTone}`}>
                    {row.label}
                  </span>
                  <span className="truncate text-[9px] text-stone-500">
                    {phase}
                    {" · "}
                    {windowTag}
                    {windowText ? ` · ${windowText}` : ""}
                    {timing}
                  </span>
                </div>
                <div className="mt-0.5 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${bar}`}
                    style={{
                      width: `${pct}%`,
                      boxShadow: isLong
                        ? "0 0 8px rgba(0, 208, 132, 0.45)"
                        : "0 0 8px rgba(255, 77, 109, 0.4)",
                    }}
                  />
                </div>
              </div>
              <span className="text-right font-mono text-[10px] font-semibold tabular-nums text-stone-300">
                {row.score}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SeasonPanel({
  title,
  loading,
  empty,
  rows,
  tone,
  windowTag,
  phaseLabels,
  onOpenList,
  onOpenMarket,
}: {
  title: string;
  loading: boolean;
  empty: string;
  rows: SeasonalityOpportunity[];
  tone: "bull" | "bear";
  windowTag: string;
  phaseLabels: Record<SeasonalityOpportunity["phase"], string>;
  onOpenList: () => void;
  onOpenMarket: (marketId: string) => void;
}) {
  const glow = tone === "bull" ? "titan-cmd-card--glow-bull" : "titan-cmd-card--glow-bear";
  const titleTone = tone === "bull" ? "text-emerald-400/90" : "text-rose-400/90";
  return (
    <article className={`titan-cmd-card titan-cmd-card--pulse min-w-0 w-full ${glow}`}>
      <div className="px-2 py-1.5 sm:px-2.5 sm:py-2">
        <button
          type="button"
          onClick={onOpenList}
          className="flex w-full items-baseline justify-between gap-2 text-left"
        >
          <p className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${titleTone}`}>{title}</p>
          <p className="font-mono text-[8px] uppercase tracking-wider text-stone-600">Score</p>
        </button>
        {loading ? (
          <p className="mt-1.5 text-[11px] text-stone-500">{empty}</p>
        ) : rows.length > 0 ? (
          <OpportunityRows
            rows={rows}
            windowTag={windowTag}
            phaseLabels={phaseLabels}
            onOpenMarket={onOpenMarket}
          />
        ) : (
          <p className="mt-1.5 text-[11px] leading-snug text-stone-500">{empty}</p>
        )}
      </div>
    </article>
  );
}

export function HomePulseCards({ bundle, onNavigate }: HomePulseCardsProps) {
  const { t } = useTitanI18n();
  const usd = useMemo(() => usdPulseFromBundle(bundle), [bundle]);

  const [longs, setLongs] = useState<SeasonalityOpportunity[]>([]);
  const [shorts, setShorts] = useState<SeasonalityOpportunity[]>([]);
  const [scanDone, setScanDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setScanDone(false);
    void (async () => {
      const ranked = await scanSeasonalOpportunities();
      if (!cancelled) {
        setLongs(ranked.longs);
        setShorts(ranked.shorts);
        setScanDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSeason = (marketId: string) =>
    onNavigate("seasonality", {
      seasonalityMarket: marketId,
      seasonalityCycles: [currentPresidentialCyclePhase()],
    });

  const windowTag = t("home.pulseSeasonWindowTag");
  const cyclePhase = useMemo(() => currentPresidentialCyclePhase(), []);
  const cycleName = t(`seasonality.presidential.${cyclePhase}`);
  const phaseLabels = useMemo(
    () =>
      ({
        active: t("home.pulseSeasonPhaseActive"),
        upcoming: t("home.pulseSeasonPhaseUpcoming"),
        next: t("home.pulseSeasonPhaseNext"),
      }) as Record<SeasonalityOpportunity["phase"], string>,
    [t],
  );

  return (
    <section className="space-y-2" aria-label={t("home.pulseTitle")}>
      <UsdMacroBanner score100={usd.score100} bias={usd.bias} onClick={() => onNavigate("dme")} />

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-titan-gold/90">
            {t("home.pulseCyclesTitle")}
            <span className="ml-1.5 font-mono font-medium normal-case tracking-normal text-stone-400">
              · {cycleName}
            </span>
          </p>
          <p className="text-[10px] text-stone-500">
            {t("home.pulseCyclesCaption", { cycle: cycleName })}
          </p>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          <SeasonPanel
            title={t("home.pulseSeasonLongTitle")}
            loading={!scanDone}
            empty={
              !scanDone ? t("home.pulseSeasonLoading") : t("home.pulseSeasonLongEmpty")
            }
            rows={longs}
            tone="bull"
            windowTag={windowTag}
            phaseLabels={phaseLabels}
            onOpenList={() => onNavigate("seasonality")}
            onOpenMarket={openSeason}
          />
          <SeasonPanel
            title={t("home.pulseSeasonShortTitle")}
            loading={!scanDone}
            empty={
              !scanDone ? t("home.pulseSeasonLoading") : t("home.pulseSeasonShortEmpty")
            }
            rows={shorts}
            tone="bear"
            windowTag={windowTag}
            phaseLabels={phaseLabels}
            onOpenList={() => onNavigate("seasonality")}
            onOpenMarket={openSeason}
          />
        </div>
      </div>
    </section>
  );
}
