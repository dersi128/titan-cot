# Market icon PNGs (optional)

Drop **transparent PNG** files here to match the 3D reference board.  
File name = market id from `institutionalMarkets.ts` (uppercase).

Examples: `GOLD.png`, `EUR.png`, `CORN.png`, `SP500.png`

If a file is missing, the dashboard uses built-in SVG glyphs with category-colored circle/shield frames.

After adding PNGs, run:

```bash
npm run icons:sync
```

This copies icons into `src/assets/markets/icons/` for Vite bundling (same flow as brand assets).

Recommended size: **128×128** or **256×256**, centered subject.
