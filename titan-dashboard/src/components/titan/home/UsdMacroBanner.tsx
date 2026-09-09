import { useTitanI18n } from "../../../i18n";
import type { UsdBiasLabel } from "../../../lib/homeUsdPulse";
import { TitanScoreRing100 } from "../ui/TitanPrimitives";
import bullArt from "../../../assets/dme/usd-macro-bull.png";
import bearArt from "../../../assets/dme/usd-macro-bear.png";

type UsdMacroBannerProps = {
  score100: number | null;
  bias: UsdBiasLabel;
  onClick?: () => void;
};

const ART: Partial<Record<UsdBiasLabel, string>> = {
  BULLISH: bullArt,
  BEARISH: bearArt,
};

export function UsdMacroBanner({ score100, bias, onClick }: UsdMacroBannerProps) {
  const { t } = useTitanI18n();
  const art = ART[bias];
  const className = `titan-usd-macro titan-usd-macro--${bias.toLowerCase()}`;
  const label = `${t("home.pulseDmeTitle")}: ${t(`home.pulseUsdBias.${bias}`)}`;

  const body = (
    <>
      {art ? <img src={art} alt="" className="titan-usd-macro__art" /> : null}
      <TitanScoreRing100 score={score100} label="USD" className="titan-usd-macro__ring" />
      <div className="titan-usd-macro__copy">
        <p className="titan-usd-macro__kicker">{t("home.pulseDmeTitle")}</p>
        <p className="titan-usd-macro__bias">{t(`home.pulseUsdBias.${bias}`)}</p>
        <p className="titan-usd-macro__sub">
          {score100 === null
            ? t("home.pulseDmeUnavailable")
            : t("home.pulseDmeSub", { score: String(score100) })}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label={label}>
        {body}
      </button>
    );
  }

  return (
    <div className={className} aria-label={label}>
      {body}
    </div>
  );
}
