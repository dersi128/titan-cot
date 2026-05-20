# Seasonality engine sync

Source of truth: `titan-dashboard/src/seasonality/` (engine + UI).

API copy: `cot-data-module/src/seasonality/` — update after engine changes:

```bash
cd cot-data-module
npm run sync:seasonality
```

Or commit both when changing calculation logic.
