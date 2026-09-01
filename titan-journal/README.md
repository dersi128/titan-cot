# TITAN Journal

Fáze 1 — základ strategie-aware obchodního deníku.

UI běží v **češtině** (`cs-CZ`, časová zóna `Europe/Prague`). Interní hodnoty (LONG/SHORT, A+, status kódy) zůstávají anglicky, ať jdou později napojit na API.

Appka zapisuje **proč** byl obchod vzat (kontext, kvalita zóny, COT, seasonalita, plán), aby šlo později analyzovat, které podmínky dávají edge.

Není to klon TradeZelly. Broker sync, auth, AI a automatické známkování záměrně nejsou v scope.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Recharts

## Spuštění

```bash
cd titan-journal
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000). Výchozí je dark mode.

## Co je ve fázi 1

- Přehled s KPI, equity křivkou, posledními obchody a snapshotem strategie
- Deník s filtry
- Detail obchodu
- Formulář Nový obchod s collapsible sekcemi a localStorage
- Placeholdery Analýza / Strategie
- Klasifikace Forex major / křížový

Obchody se ukládají do `localStorage` přes `lib/storage.ts`, aby šel později vyměnit za databázi.

## Skripty

```bash
npm run dev
npm run build
npm run typecheck
npm run test
```
