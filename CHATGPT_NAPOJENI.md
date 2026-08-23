# ChatGPT ↔ TITAN COT — krok za krokem

Připojení **Custom GPT** k TITAN API, aby ChatGPT uměl stáhnout data a napsat **COT Report**.

## Co už je v kódu

Na Render API (`https://titan-cot.onrender.com`):

| Endpoint | Účel |
|----------|------|
| `GET /api/gpt/markets` | seznam trhů (gold, nasdaq, …) |
| `GET /api/gpt/cot-report?market=gold` | kompaktní COT report |
| `GET /api/gpt/cot/gold` | totéž přes path |

Soubory v repu:

- `cot-data-module/chatgpt/openapi.yaml` — schema pro Actions  
- `cot-data-module/chatgpt/GPT_INSTRUCTIONS.md` — instrukce GPT  

---

## Krok 1 — Deploy API (Render)

1. Pushni / počkej na deploy služby **titan-cot** (cot-data-module).
2. V prohlížeči otevři:  
   `https://titan-cot.onrender.com/health`  
   Měl bys vidět `"status":"ok"` a po nastavení klíče i `"chatgptApiKeyConfigured": true`.

---

## Krok 2 — API klíč na Renderu

1. [Render Dashboard](https://dashboard.render.com) → služba TITAN COT API  
2. **Environment** → **Add Environment Variable**  
3. Name: `CHATGPT_API_KEY`  
4. Value: silný náhodný řetězec (např. 32+ znaků) — **ulož si ho**  
5. **Save** → počkej na redeploy  

Bez tohoto klíče jsou `/api/gpt/*` otevřené (jen pro test). Pro produkci klíč **nastav**.

Test v PowerShell:

```powershell
Invoke-RestMethod "https://titan-cot.onrender.com/api/gpt/cot-report?market=gold" -Headers @{ "X-Titan-Key" = "TVUJ_KLIC" }
```

---

## Krok 3 — Vytvoř Custom GPT

1. Jdi na [https://chatgpt.com](https://chatgpt.com) (Plus / Team / Pro — Custom GPT potřebuje placený plán).  
2. Vlevo **Explore GPTs** → **Create a GPT** (nebo [https://chatgpt.com/gpts/editor](https://chatgpt.com/gpts/editor)).  
3. Záložka **Configure**.

### Name / Description
- Name: `TITAN COT`
- Description: `COT reporty z TITAN API (commercials, score, verdict).`

### Instructions
Zkopíruj obsah souboru  
`cot-data-module/chatgpt/GPT_INSTRUCTIONS.md`  
do pole **Instructions**.

### Conversation starters (volitelné)
- `COT Report Gold`
- `COT Report Nasdaq`
- `Jaké trhy umíš?`

---

## Krok 4 — Actions (napojení API)

1. V editoru GPT klikni **Create new action**.  
2. **Import from URL** nebo **Schema** → vlož obsah  
   `cot-data-module/chatgpt/openapi.yaml`  
   (celý YAML).  
3. **Authentication**:
   - Type: **API Key**
   - Auth Type: **Custom**
   - Custom Header Name: `X-Titan-Key`
   - API Key: stejná hodnota jako `CHATGPT_API_KEY` na Renderu  
4. **Privacy policy URL**: můžeš dát dočasně odkaz na dashboard, např.  
   `https://titan-cot.vercel.app`  
5. **Test** u `getCotReport` s `market=gold` — musí vrátit JSON.  
6. **Update** / **Publish** (Only me / Anyone with link).

---

## Krok 5 — Použití

V chatu s GPT napiš např.:

> COT Report Gold

GPT zavolá API a napíše report (datum, score, commercials, retail, shrnutí).

Další příklady:
- `COT na stříbro`
- `Nasdaq COT verdict`
- `Porovnej gold a silver`

---

## Troubleshooting

| Problém | Řešení |
|--------|--------|
| 401 Unauthorized | Špatný klíč / špatný header (`X-Titan-Key`) |
| 404 Unknown market | Nejdřív „Jaké trhy umíš?“ nebo `listCotMarkets` |
| Timeout / cold start | Render free spí — první request může trvat 30–60 s, zkus znovu |
| GPT nevvolá Action | V Instructions musí být „call the API first“; Actions musí být uložené a otestované |
| Schema import error | Zkopíruj celý `openapi.yaml` bez úprav |

---

## Bezpečnost (doporučení)

- Klíč nesdílej veřejně.  
- GPT nastav na **Only me**, dokud testuješ.  
- Endpointy `/api/cot/*` (dashboard) zůstávají oddělené; GPT používá jen `/api/gpt/*`.

Až poběží Render s novým deployem + klíčem, napiš — projdeme spolu první test „COT Report Gold“.
