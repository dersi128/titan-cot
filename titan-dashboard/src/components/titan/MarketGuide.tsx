import type { InstitutionalMarket } from "../../config/institutionalMarkets";

type MarketGuideProps = {
  market: InstitutionalMarket;
};

const GUIDE_ITEMS = [
  {
    title: "TITAN Score & Verdict",
    body: "Souhrnný institucionální bias od −100 do +100. Verdict (např. B LONG, WEAK SHORT) popisuje směr positioning kampaně — ne vstup do obchodu.",
  },
  {
    title: "Commercial 26W index",
    body: "Kde jsou chytré peníze (commercials) vůči vlastnímu 26týdennímu rozsahu. 0 = dno okna, 100 = vrchol. Hlavní driver TITAN skóre.",
  },
  {
    title: "Δ Commercial (1W · 4W · 13W)",
    body: "Týdenní, měsíční a čtvrtletní změna čisté komerční pozice. Kladné = akumulace, záporné = distribuce.",
  },
  {
    title: "Retail & Non-commercial",
    body: "Retail často kontrární k commercials. Divergence = commercials a fondy se týden pohybují opačně (institucionální napětí).",
  },
  {
    title: "TradingView (nahoře)",
    body: "Cenový graf futures — musí sedět symbol pod názvem (např. CME:6A1! pro AUD). Není to Apple ani akcie, pokud widget načte správně.",
  },
  {
    title: "COT indikátor (dole)",
    body: "Historie čistých net pozic: žlutá = commercials, modrá = fondy, růžová = retail. CFTC Legacy Futures Only.",
  },
] as const;

export function MarketGuide({ market }: MarketGuideProps) {
  return (
    <section className="rounded-xl border border-titan-gold/20 bg-gradient-to-br from-titan-gold/[0.06] via-titan-panel/40 to-titan-black/30 px-4 py-4 md:px-5 md:py-5">
      <header className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-titan-gold">
          Průvodce · {market.shortLabel}
        </p>
        <h2 className="mt-1 text-base font-semibold text-stone-100">Co je co a jak to funguje</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          TITAN čte COT reporty CFTC (Legacy Futures) a skládá{" "}
          <strong className="font-medium text-stone-400">institucionální bias</strong> pro swing
          trading. Vždy platí:{" "}
          <span className="text-titan-goldDim">Bias only, not execution.</span> — žádný buy/sell signál.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {GUIDE_ITEMS.map((item) => (
          <li
            key={item.title}
            className="rounded-lg border border-titan-line/60 bg-titan-black/25 px-3 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-titan-goldBright/90">
              {item.title}
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-stone-500">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
