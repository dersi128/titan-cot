# TITAN COT — nasazení pro kamarády (0 Kč)

## Rychlý checklist

- [ ] 1. GitHub repo (obě složky nebo monorepo)
- [ ] 2. Render → API běží (`/health` → `{"status":"ok"}`)
- [ ] 3. Vercel → dashboard + `VITE_COT_API_URL`
- [ ] 4. Render → `CORS_ORIGIN` = Vercel URL → redeploy
- [ ] 5. Pošli kamarádům Vercel odkaz

---

## 1. GitHub

### Varianta A — jeden repo (doporučeno)

V kořeni vytvoř repo `titan-cot` a nahraj:

```
titan-cot/
  cot-data-module/
  titan-dashboard/
```

```powershell
cd C:\Users\dersi
mkdir titan-cot
# zkopíruj nebo přesuň obě složky do titan-cot
cd titan-cot
git init
git add .
git commit -m "TITAN COT dashboard + API"
# na GitHub.com New repository → titan-cot
git remote add origin https://github.com/TVUJ-UCET/titan-cot.git
git push -u origin main
```

### Varianta B — bez GitHubu

Na Renderu lze **Manual Deploy** z ZIP složky `cot-data-module` (méně pohodlné pro aktualizace).

---

## 2. API na Render.com

1. [render.com](https://render.com) → přihlášení (GitHub)
2. **New +** → **Web Service**
3. Připoj repo `titan-cot`
4. Nastavení:

| Pole | Hodnota |
|------|---------|
| **Name** | `titan-cot-api` |
| **Root Directory** | `cot-data-module` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | Free |

5. **Environment** (zatím jen cache):

| Key | Value |
|-----|--------|
| `COT_CACHE_TTL_MS` | `900000` |

`CORS_ORIGIN` doplníš až po Vercelu (krok 4).

6. **Create Web Service** → počkej na Deploy **Live**
7. URL zkopíruj, např. `https://titan-cot-api.onrender.com`
8. V prohlížeči: `https://titan-cot-api.onrender.com/health`  
   → musí být `{"status":"ok",...}`

---

## 3. Dashboard na Vercel.com

1. [vercel.com](https://vercel.com) → přihlášení (GitHub)
2. **Add New…** → **Project** → repo `titan-cot`
3. **Root Directory** → `titan-dashboard`
4. **Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_COT_API_URL` | `https://titan-cot-api.onrender.com` *(tvoje Render URL, bez `/` na konci)* |

5. **Deploy**
6. Po deployi zkopíruj URL, např. `https://titan-cot-xxx.vercel.app`

Otevři dashboard — měl by načíst trhy (první load může trvat ~1 min kvůli probuzení API).

---

## 4. CORS (důležité)

1. Render → služba `titan-cot-api` → **Environment**
2. Přidej:

| Key | Value |
|-----|--------|
| `CORS_ORIGIN` | `https://titan-cot-xxx.vercel.app` |

*(přesně tvoje Vercel URL, bez lomítka na konci)*

3. **Save Changes** → Render sám redeployne

---

## 5. Kamarád

Pošli mu **jen Vercel odkaz**.  
V prohlížeči otevře → hotovo. Žádná instalace.

---

## Když něco nejde

| Problém | Řešení |
|---------|--------|
| Vercel build spadne na `tsc` / `vite build` | **Root Directory** musí být `titan-dashboard` (ne `./`). V Build Logs scrolluj dolů — tam je přesná chyba. Po pushi nejnovějšího commitu build běží jen `vite build` (Node ≥ 20). |
| Dashboard „Connection failed“ | API neběží → `/health` na Renderu |
| Prázdná data / CORS chyba v konzoli (F12) | `CORS_ORIGIN` = přesná Vercel URL, redeploy API |
| První load velmi pomalý | Free Render spí → počkat 30–60 s, obnovit stránku |
| Lokálně funguje, online ne | V Vercelu chybí `VITE_COT_API_URL` (Render URL, ne placeholder) |

---

## Lokální vývoj (u tebe)

```powershell
# Terminál 1
cd cot-data-module
npm install
npm run dev

# Terminál 2
cd titan-dashboard
npm install
npm run dev
```

→ http://localhost:5173
