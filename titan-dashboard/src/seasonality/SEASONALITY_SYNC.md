# Seasonality engine sync

Source of truth for **UI**: `titan-dashboard/src/seasonality/`

API keeps its own Node-compatible copy: `cot-data-module/src/seasonality/`
(`.js` import extensions, no Vite `import.meta.env`).

Do **not** auto-sync on Render build — it breaks `tsc`.

To port engine changes manually:

```bash
cd cot-data-module
ALLOW_SEASONALITY_SYNC=1 npm run sync:seasonality
# then fix relative imports to use .js extensions and re-test build
npm run build
```
