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

function DecorChart({ bias }: { bias: UsdBiasLabel }) {
  if (bias === "NEUTRAL") return null;
  const up = bias === "BULLISH";
  const stroke = up ? "#10D99A" : "#FF4567";
  const line = up ? "8,78 48,62 88,54 128,36 168,28 212,12" : "8,14 48,28 88,36 128,54 168,66 212,80";
  const bars = up
    ? [
        [18, 58, 22],
        [48, 46, 18],
        [78, 40, 20],
        [108, 32, 16],
        [138, 24, 18],
        [168, 18, 14],
        [198, 12, 16],
      ]
    : [
        [18, 16, 16],
        [48, 22, 18],
        [78, 30, 16],
        [108, 40, 20],
        [138, 48, 18],
        [168, 58, 16],
        [198, 66, 18],
      ];
  return (
    <svg className="titan-usd-macro__chart" viewBox="0 0 220 90" aria-hidden>
      {bars.map(([x, y, h], i) => (
        <rect key={i} x={x} y={y} width="7" height={h} rx="1" fill={stroke} />
      ))}
      <polyline fill="none" stroke={stroke} strokeWidth="1.6" points={line} />
    </svg>
  );
}

export function UsdMacroBanner({ score100, bias, onClick }: UsdMacroBannerProps) {
  const { t } = useTitanI18n();
  const art = ART[bias];
  const className = `titan-usd-macro titan-usd-macro--${bias.toLowerCase()}`;
  const label = `${t("home.pulseDmeTitle")}: ${t(`home.pulseUsdBias.${bias}`)}`;

  const body = (
    <>
      <DecorChart bias={bias} />
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
