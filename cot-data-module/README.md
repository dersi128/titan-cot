# COT Data Module

Express API server that fetches GOLD Legacy Futures Only Commitments of Traders data from the official CFTC Socrata API and returns dashboard-ready JSON for `XAUUSD`.

## Source

- Dataset: CFTC Legacy - Futures Only
- Socrata resource: `https://publicreporting.cftc.gov/resource/6dca-aqww.json`
- GOLD filter: `commodity_name = 'GOLD' AND contract_market_name = 'GOLD'`, with a client-side guard for the standard GOLD futures market.

## API

- Server: `http://localhost:3000`
- Current endpoint: `GET /api/cot/gold`
- Health check: `GET /health`
- Planned COT symbols: `gold`, `jpy`, `cocoa`, `nas100`
- CORS is enabled for dashboard clients.

## Usage

```ts
import { fetchGoldCotDashboardData } from "./src/cotGold";

const cot = await fetchGoldCotDashboardData();
console.log(cot);
```

Install dependencies:

```bash
npm install
```

Run the Express API:

```bash
npm run start
```

Build:

```bash
npm run build
```

Future symbol routes can be added by wiring handlers into `cotHandlers` in `src/server.ts`.

## Signal Rules

- Net positions are `long - short` for Commercial, Non-Commercial, and Non-Reportable groups.
- The 26-week and 52-week COT indexes are calculated as `(current net - period low) / (period high - period low) * 100`.
- Commercial bias is bullish above `80` on both indexes, bearish below `20` on both indexes, otherwise neutral.
- The COT verdict uses a long-side score: `20+` is `A+ LONG`, `15+` is `A LONG`, `10+` is `B LONG`, and below `10` is `NEUTRAL`.
- Commercial indexes drive the score, with extra weight above `90` so extreme commercial accumulation does not fall back to neutral.
- Non-commercial bullish divergence adds points; bearish divergence subtracts points.
- Increasing commercial weekly net change adds bullish points; decreasing weekly net change subtracts points.
- Retail uses Non-Reportable positioning as confirmation only when it is opposite to the commercial bias; aligned retail positioning is treated as weak.
