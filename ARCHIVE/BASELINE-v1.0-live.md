# TITAN COT — Baseline v1.0 (LIVE)

**Datum archivace:** 2026-05-19  
**Stav:** Produkce funkční — dashboard načítá 27 trhů z Render API.

---

## Live URL

| Služba | URL |
|--------|-----|
| Dashboard (Vercel) | https://titan-cot.vercel.app |
| API (Render) | https://titan-cot.onrender.com |
| Health check | https://titan-cot.onrender.com/health |
| GitHub | https://github.com/dersi128/titan-cot |

Kořen API (`/`) vrací `Trasa nenalezena` — **očekávané**.

---

## Environment (produkce)

### Render (`cot-data-module`)

| KEY | VALUE |
|-----|--------|
| `CORS_ORIGIN` | `https://titan-cot.vercel.app` |
| `COT_CACHE_TTL_MS` | `900000` (15 min) |

### Vercel (`titan-dashboard`)

| KEY | VALUE |
|-----|--------|
| `VITE_COT_API_URL` | `https://titan-cot.onrender.com` |

**Root Directory na Vercelu:** `titan-dashboard`  
**Root Directory na Renderu:** `cot-data-module`

---

## Struktura repozitáře

```text
titan-cot/
  cot-data-module/     # Express API, CFTC fetch, cotLogicEngine
  titan-dashboard/     # React + Vite + Tailwind, TITAN UI
  ARCHIVE/             # tento baseline (od 2026-05-19)
```

---

## Stack

| Vrstva | Technologie |
|--------|-------------|
| API | Node, Express, TypeScript, CORS |
| Data | CFTC Socrata `6dca-aqww` (Legacy Futures Only) |
| UI | React 19, Vite 8, Tailwind 3, Recharts |
| Host | Render (API) + Vercel (UI) |

---

## Update dat (automaticky)

| Co | Interval |
|----|----------|
| UI refresh (`REFRESH_MS`) | 120 s |
| API cache per symbol | 15 min (`COT_CACHE_TTL_MS`) |
| Nový CFTC report | ~1× týdně (po vypršení cache) |
| Render free sleep | první request po pauze 30–90 s |

---

## 27 trhů (watchlist)

Forex: DXY, EUR, JPY, GBP, AUD, CAD, CHF  
Metals: GOLD, SILVER, PLAT, PALL, COPPER  
Energy: OIL, NG  
Grains: CORN, SOY, WHEAT  
Softs: COFFEE, COCOA, SUGAR, COTTON  
Livestock: CATTLE, HOGS  
Indices: SP 500 (ES1!), NAS 100 (NQ1!), DOW, RTY  

Výchozí výběr v UI: **DXY**.

---

## UI moduly (baseline)

- **Global COT Scanner** — řazení podle |dashboard skóre|
- **COT Heatmap** — barvy = commercial 26W/52W; amber ring = retail 26W extrém
- **Market Detail** — metriky, Recharts historie netů, embedded AI Verdict
- **AI Verdict** — pravidlový text (`buildInstitutionalNarrative`), ne LLM

---

## Scoring — dvě verze (známý stav)

### API (`cot-data-module/src/cotLogicEngine.ts`)

- Pole v JSON: `cotScore`, `cotVerdict` (`A+ LONG` … bez „BIAS“)
- Komponenty: commercial extrémy ±35/±20, retail contrarian ±15, Δ1W/4W/13W ±10, NC divergence ±10
- Max teoreticky cca ±100 po clampu

### Dashboard (`titan-dashboard/src/lib/titanCotScore.ts`)

- Scanner / heatmap / AI panel používají **tuto** verzi
- Verdict: `A+ LONG BIAS`, `B LONG BIAS`, …
- Komponenty: comm 26W ±40, 52W ±20, retail 26W ±15, comm Δ1W ±10, NC divergence ±15

**Poznámka pro budoucí update:** sjednotit obě verze, pokud má být jeden kanonický score všude.

---

## Klíčové soubory

| Oblast | Soubor |
|--------|--------|
| CFTC fetch + výstup | `cot-data-module/src/cotGold.ts` |
| API scoring | `cot-data-module/src/cotLogicEngine.ts` |
| Mapování trhů | `cot-data-module/src/cotMarketMap.ts` |
| Bundle endpoint | `cot-data-module/src/cotBundle.ts` |
| Cache | `cot-data-module/src/cotCache.ts` |
| Server | `cot-data-module/src/server.ts` |
| UI watchlist | `titan-dashboard/src/config/institutionalMarkets.ts` |
| UI scoring | `titan-dashboard/src/lib/titanCotScore.ts` |
| Data client | `titan-dashboard/src/data/cotData.ts` |
| Hlavní layout | `titan-dashboard/src/components/titan/TitanCotDashboard.tsx` |

---

## Deploy workflow (po změnách kódu)

1. Upravit soubory lokálně (repo `titan-cot`)
2. GitHub Desktop → Commit → Push
3. Vercel + Render auto-redeploy
4. Ověřit https://titan-cot.vercel.app (počkat 1–2 min na API)

Terminál **není** potřeba pro běžící provoz.

---

## Co baseline záměrně neobsahuje

- Pine Script (`TITAN_SD_COT_SCORING.pine`) — mimo web deploy
- Lokální SD/trend/location engine ze staršího dashboardu — odstraněno z `App.tsx`, legacy soubory mohou zůstat ve `src/`

---

## Obnovení tohoto stavu v Gitu

Po commitu s tímto `ARCHIVE/` obsahem:

```bash
git tag -a v1.0-live -m "Baseline: live Vercel + Render, 27 markets"
git push origin v1.0-live
```

(Nebo tag v GitHub Desktop → Create tag.)
