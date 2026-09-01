# TITAN Journal

Phase 1 foundation for a strategy-aware trading journal.

This app records **why** a trade was taken (context, zone quality, COT, seasonality, plan) so later phases can analyse which conditions actually produce edge.

It is not a TradeZella clone. Broker sync, auth, AI and automatic grading are intentionally out of scope.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Recharts

## Run

```bash
cd titan-journal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Dark mode is the default.

## What's in Phase 1

- Dashboard with KPIs, equity curve, recent trades and a mock strategy snapshot
- Journal table with basic filters
- Trade detail
- New Trade form with collapsible sections and local persistence
- Analytics / Strategy placeholders
- Forex Major / Cross classification

Trades are stored in `localStorage` behind `lib/storage.ts` so a database can replace it later.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run test
```
