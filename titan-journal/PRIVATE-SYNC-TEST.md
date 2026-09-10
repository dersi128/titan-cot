# TITAN Journal – soukromý test synchronizace

Stav: připravený kód, cloud ve výchozím stavu VYPNUTÝ. Žádný projekt Supabase ani veřejné nasazení nebyly vytvořeny. Původní COT aplikace se nemění.

## Co je připravené

- Přihlášení e-mailem a jednorázovým kódem pro předem založené testovací účty. Veřejná registrace je vypnutá (`shouldCreateUser: false`).
- Synchronizace obchodů, profilu, nastavení a Playbooků. Vložené obrázky se zatím ukládají uvnitř dokumentu pod stejnými právy; nevznikají veřejné odkazy ani veřejný bucket.
- Automatické ukládání po změně, kontrola změn druhého zařízení každých 15 sekund a při návratu do okna.
- Optimistický zámek podle revize. Při souběžné úpravě se lokální kopie nezahodí: zápis se zastaví, zobrazí se konflikt a možnost exportu a načtení aktuální verze.
- První přihlášení nabízí prázdný deník nebo výslovně potvrzený přenos kopie lokálních dat. Původní localStorage se nepřepisuje.
- Cloudová pracovní data a přihlašovací tokeny jsou pouze v paměti, ne v localStorage. Po obnovení stránky je třeba se znovu přihlásit. To je záměr pro první soukromý test.
- Cloud je explicitně zakázán na Vercel Production. Nastavení `off` zachová dosavadní lokální režim.

## Soukromí

Repozitář ponechat PRIVATE. Neposílat hesla ani tajné klíče do chatu či Gitu.

Tabulka má zapnuté i vynucené RLS. Nepřihlášený uživatel nemá oprávnění. Přihlášený uživatel může číst a měnit pouze řádek, kde `auth.uid() = user_id`. Funkce používá identitu z ověřeného tokenu a běží jako volající, nikoli administrátor. Nikdy nepotřebuje `service_role`.

Publishable key je záměrně veřejná identifikace projektu, nikoli tajné heslo. Ochranu dat zajišťuje autentizace a RLS. Administrátor databáze a provozovatel infrastruktury mohou mít privilegovaný přístup. Toto NENÍ koncové šifrování před provozovatelem. Pokud má být obsah tajný i před tebou jako správcem, potřebujeme samostatný návrh koncového šifrování a obnovy klíčů.

Nyní nebyla žádná data odeslána do Supabase. Při testu používat syntetické obchody. Nenahrávat skutečnou historii, dokud neprojdou níže uvedené kontroly.

## Spuštění v oddělené testovací kopii

1. Zkopírovat změny do nové větve např. `test/private-journal-sync`. Nemergovat do `main`, nenastavovat Production proměnné a nenasazovat bez dalšího rozhodnutí.
2. `npm ci`, potom zkopírovat `.env.staging.example` do `.env.local`. S `TITAN_SYNC_MODE=off` se aplikace chová jako dříve.
3. Pro cloud založit SAMOSTATNÝ prázdný Supabase testovací projekt. Spustit `supabase/migrations/202609100001_staging_journal.sql` pouze v něm.
4. V Supabase Auth zakázat nové veřejné registrace a předem vytvořit dvě testovací identity. Nastavit e-mailovou OTP šablonu, aby obsahovala `{{ .Token }}` (kód, nikoli magic link). Pro e-maily mimo omezení vestavěného odesílače nastavit vlastní SMTP. Neměnit produkční Auth ani e-mailové šablony.
5. Do lokálního `.env.local` doplnit URL, project ref a `sb_publishable_...` klíč tohoto testovacího projektu, pak přepnout režim na `staging`. Do zdrojového kódu žádné hodnoty nevkládat. Kontrola project ref odhaluje překlep, sama nerozezná testovací projekt od produkčního – správný projekt musí vybrat správce.
6. Spustit `npm run dev`. Pro test mobilu zpřístupnit jen tuto testovací instanci v důvěryhodné síti, nebo později použít chráněné HTTPS preview. Nevytvářet veřejné preview ani share link se skutečnými daty.
7. Přihlásit PC a mobil stejným testovacím účtem. Založit syntetický obchod, počkat na „Uloženo v testovacím účtu“ a ověřit načtení na druhém zařízení.

## Ověření před jakýmkoli ostrým spuštěním

- Účet A vytvoří data, účet B je nevidí. Přímý REST dotaz na `user_id` účtu A s tokenem B vrátí prázdný výsledek; pokus o vložení/změnu cizího `user_id` je odmítnut RLS. Bez tokenu je čtení i zápis odmítnut. Ověřit i přímé volání RPC.
- PC a mobil mají stejný účet: přidání, úprava, smazání, screenshot a Playbook se přenesou. Dva nezávislé účty mají oddělené dokumenty.
- Současná editace stejné revize na dvou zařízeních vyvolá konflikt, nikdy tiché přepsání. Exportovat druhou kopii před načtením aktuální.
- Vypnout síť, udělat změnu: nesmí se zobrazit „Uloženo“. Po návratu sítě ověřit zápis nebo konflikt. Před obnovením stránky exportovat neuložená data. Varování při zavření stránky nemusí fungovat při násilném ukončení mobilního prohlížeče.
- Odhlásit A a přihlásit B ve stejné záložce: nesmí se objevit data A. Po obnovení stránky nesmí zůstat cloudová data ani token v místním úložišti.
- Lokální migrace do prázdného cloudu zachová původní data; není to slučování dvou existujících deníků. Import již existující cloudové historie provádět až po záloze.

## Limity této přípravy

Celý deník se zatím ukládá jako jeden dokument, max. 4 MB na klientovi. Jde o staging základ, ne škálovatelnou produkční databázi. Větší screenshoty a rozsáhlé deníky potřebují samostatné soukromé úložiště obrázků a synchronizaci po záznamech. Při konfliktu nelze dále editovat do vyřešení; automatické slučování není implementované. Rozpracovaný neuložený formulář se nepřenáší. Offline fronta se neukládá na disk, aby na sdíleném zařízení nezůstávala cloudová historie.

Zálohy a obnovu databáze, nastavení poskytovatele, produkční registraci, platební systém ani mobilní GUI nelze potvrdit bez připojeného testovacího projektu. Živá RLS pravidla nebyla v tomto prostředí spuštěna. Unit testy nenahrazují ověření oprávnění proti skutečné databázi.

## Lokální kontroly

`npm test`

`npx next typegen && npm run typecheck`

`npx eslint app/layout.tsx components/cloud lib/cloud lib/storage.ts lib/workspace-storage.ts`

`NEXT_TELEMETRY_DISABLED=1 npm run build`
