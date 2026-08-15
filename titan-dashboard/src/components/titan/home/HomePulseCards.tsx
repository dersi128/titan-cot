import { useEffect, useMemo, useState } from "react";
import type { CotDashboardData } from "../../../types";
import type { AppSection } from "../../../lib/titanAppRoute";
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
  onNavigate: (section: AppSection) => void;
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

function PulseCard({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="titan-cmd-card w-full text-left transition hover:border-white/15"
    >
      {children}
    </button>
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

  const best = longs?.[0] ?? null;
  const second = longs?.[1] ?? null;

  return (
    <section className="grid gap-3 sm:grid-cols-2" aria-label={t("home.pulseTitle")}>
      <PulseCard onClick={() => onNavigate("dme")}>
        <div className="flex items-center gap-3 p-1 sm:gap-4 sm:p-2">
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
      </PulseCard>

      <PulseCard onClick={() => onNavigate("seasonality")}>
        <div className="flex h-full min-h-[100px] flex-col justify-center p-1 sm:p-2">
          <p className="titan-cmd-kicker">{t("home.pulseSeasonTitle")}</p>
          {!scanDone ? (
            <p className="mt-3 text-[13px] text-stone-500">{t("home.pulseSeasonLoading")}</p>
          ) : best ? (
            <>
              <p
                className={`mt-2 font-display text-xl font-semibold tracking-wide ${
                  best.bias === "BULLISH" ? "text-emerald-400" : "text-sky-300"
                }`}
              >
                {best.label}
                <span className="ml-2 font-mono text-base text-stone-300">{best.score}/100</span>
              </p>
              <p className="mt-1 text-[12px] text-stone-500">
                {t("home.pulseSeasonReason", {
                  strength: t(`seasonality.strength.${best.strength}`),
                  wr: best.winRate.toFixed(0),
                })}
              </p>
              {second ? (
                <p className="mt-2 text-[11px] text-stone-600">
                  {t("home.pulseSeasonSecond", {
                    label: second.label,
                    score: String(second.score),
                  })}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-[13px] text-stone-500">{t("home.pulseSeasonEmpty")}</p>
          )}
        </div>
      </PulseCard>
    </section>
  );
}
