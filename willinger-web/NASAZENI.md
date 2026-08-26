# Nasazení Willinger webu (24/7 jako Titan)

Titan běží na [titan-cot.vercel.app](https://titan-cot.vercel.app). Willinger má **vlastní Vercel projekt** ve složce `willinger-web/`, aby se Titan nerozbil.

## Jednorázově (převzít na tvůj účet)

1. Otevři claim odkaz z deploye (přijde v chatu).
2. Přihlas se **stejným Vercel účtem** jako Titan.
3. V Vercel → Add New Project → repo `dersi128/titan-cot`:
   - **Root Directory:** `willinger-web`
   - Framework: Next.js
4. Deploy. Od té chvíle každá úprava v `willinger-web/` na `main` jde ven sama, bez tebe.

## Lokálně

```bash
cd willinger-web
npm install
npm run dev
```
