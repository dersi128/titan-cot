# TITAN Journal

Samostatný strategický obchodní deník (Fáze 1). Next.js App Router, TypeScript, Tailwind, shadcn/ui, Recharts. UI v češtině (`cs-CZ`, `Europe/Prague`).

**Pozor:** je to oddělený projekt — není součástí TITAN COT dashboardu.

## Nasazení na Vercel (24/7 veřejná URL)

1. Na [vercel.com](https://vercel.com/new) → **Add New… → Project** → importuj repo `dersi128/titan-cot`.
2. V kroku **Configure Project** nastav **Root Directory** na `titan-journal` (tlačítko Edit).
3. Framework se detekuje automaticky (Next.js). Žádné env proměnné nejsou potřeba.
4. **Deploy** → dostaneš URL typu `titan-journal-xxx.vercel.app`, běží nonstop.

Vercel bere produkci z větve `main` — po mergi PR se bude nasazovat automaticky při každém pushi. (Root `vercel.json` patří projektu TITAN COT a tohoto projektu se netýká — Vercel čte konfiguraci až od Root Directory.)

## Lokální vývoj

```bash
npm install
npm run dev        # port 3000
npm run test       # vitest
npm run typecheck
npm run build
```

## Data

Fáze 1 ukládá obchody do `localStorage` (klíč `titan-journal.trades.v2`) za adaptérem `TradeRepository` (`lib/storage.ts`) — každý návštěvník má vlastní data, při prvním otevření se nasadí mock seed 47 obchodů. Výměna za API/databázi je připravená bez zásahu do UI.
