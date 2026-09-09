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
    <ul className="titan-season-list">
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
              className="titan-season-row"
            >
              <span className="titan-season-row__idx">{i + 1}</span>
              <div className="titan-season-row__body">
                <div className="titan-season-row__meta">
                  <span className={`titan-season-row__name ${labelTone}`}>
                    {row.label}
                  </span>
                  <span className="titan-season-row__sub">
                    {phase}
                    {" · "}
                    {windowTag}
                    {windowText ? ` · ${windowText}` : ""}
                    {timing}
                  </span>
                </div>
                <div className="titan-season-row__bar">
                  <div
                    className={`titan-season-row__fill ${bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="titan-season-row__score">
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
  return (
    <article className={`titan-cmd-card titan-cmd-card--pulse ${glow}`}>
      <div className="titan-season-panel">
        <button
          type="button"
          onClick={onOpenList}
          className="titan-season-panel__head"
        >
          <p className="titan-cmd-kicker">{title}</p>
          <p className="titan-season-panel__score-label">Score</p>
        </button>
        {loading ? (
          <p className="titan-season-panel__empty">{empty}</p>
        ) : rows.length > 0 ? (
          <OpportunityRows
            rows={rows}
            windowTag={windowTag}
            phaseLabels={phaseLabels}
            onOpenMarket={onOpenMarket}
          />
        ) : (
          <p className="titan-season-panel__empty">{empty}</p>
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
    <section className="titan-home-row titan-home-row--pulse" aria-label={t("home.pulseTitle")}>
      <UsdMacroBanner score100={usd.score100} bias={usd.bias} onClick={() => onNavigate("dme")} />
      <SeasonPanel
        title={`${t("home.pulseCyclesTitle")} · ${cycleName}`}
        loading={!scanDone}
        empty={!scanDone ? t("home.pulseSeasonLoading") : t("home.pulseSeasonLongEmpty")}
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
        empty={!scanDone ? t("home.pulseSeasonLoading") : t("home.pulseSeasonShortEmpty")}
        rows={shorts}
        tone="bear"
        windowTag={windowTag}
        phaseLabels={phaseLabels}
        onOpenList={() => onNavigate("seasonality")}
        onOpenMarket={openSeason}
      />
    </section>
  );
}
