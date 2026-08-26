# Nasazení Willinger webu (24/7 jako Titan)

Titan nech na [titan-cot.vercel.app](https://titan-cot.vercel.app). **Projekt `titan-cot` v Vercelu neotevírej a neměň.**

Willinger už má vlastní projekt: [willinger-web](https://vercel.com/dersisvan-s-projects/willinger-web).
Bez nastavení níže Vercel staví kořen repa (Titan) a `https://willinger-web.vercel.app` ukazuje TITAN COT.

Web v kódu je hotový (větev `cursor/willinger-web-redesign-d9af`). Složka `willinger-web/` na `main` ještě není.

## Jednorázově v existujícím projektu willinger-web

1. Otevři [Build & Deployment](https://vercel.com/dersisvan-s-projects/willinger-web/settings/build-and-deployment).
2. **Root Directory** → `willinger-web` → Save.
3. [Git nastavení](https://vercel.com/dersisvan-s-projects/willinger-web/settings/git) → **Production Branch** → `cursor/willinger-web-redesign-d9af` → Save.
   (Až se PR sloučí do `main`, vrať Production Branch na `main`.)
4. [Deployments](https://vercel.com/dersisvan-s-projects/willinger-web/deployments) → poslední **Failed** → **Redeploy** → vypni *Use existing Build Cache*.

Až bude **Ready**:

- [willinger-web.vercel.app](https://willinger-web.vercel.app) = německy
- [willinger-web.vercel.app/cs](https://willinger-web.vercel.app/cs) = česky
- [titan-cot.vercel.app](https://titan-cot.vercel.app) = pořád Titan

Nový projekt nepřidávej. Claim odkaz nepoužívej.

## Lokálně

```bash
cd willinger-web
npm install
npm run dev
```
