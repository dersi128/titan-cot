# Willinger Wild und Fleisch — Web-Neuauflage

Moderne Neuinterpretation der Jimdo-Seite
[willinger-wildundfleisch.jimdofree.com](https://willinger-wildundfleisch.jimdofree.com/).

Tohle je designová kopie, ne oficiální web. Titan COT se nemění.

## 24/7 hosting (jako Titan)

Titan běží na Vercelu. Willinger musí být **samostatný** Vercel projekt
(root directory `willinger-web`), jinak by přepsal Titan dashboard.

1. Ve Vercelu: Add New Project → stejný GitHub repo `dersi128/titan-cot`
2. Root Directory nastav na `willinger-web`
3. Framework: Next.js, Deploy

Po napojení každého pushu se web znovu nasadí a běží bez tvého počítače.

## Lokal spuštění

```bash
cd willinger-web
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000)
