export const site = {
  name: "Willinger Wild und Fleisch GmbH",
  shortName: "Willinger",
  productionUrl: "https://willinger-web.vercel.app",
  founded: 2005,
  vetMark: "AT 30123 EG",
  address: {
    street: "Untermarkersdorf 25",
    zip: "2061",
    city: "Hadres",
    region: "Weinviertel, Niederösterreich",
    country: { de: "Österreich", cs: "Rakousko" },
    mapsQuery: "Untermarkersdorf 25, 2061 Hadres, Österreich",
  },
  phone: {
    display: "02943 / 3682",
    href: "tel:+4329433682",
  },
  fax: {
    display: "02943 / 3681",
  },
  email: "wild.willinger@aon.at",
  legal: {
    fn: "FN 266357 b",
    court: "Landesgericht Korneuburg",
    uid: "ATU61945505",
    managers: ["Vladimira Willinger"],
  },
} as const;

export type Locale = "de" | "cs";

export function localeFromPath(pathname: string): Locale {
  return pathname === "/cs" || pathname.startsWith("/cs/") ? "cs" : "de";
}

export function pathFor(locale: Locale, href: string) {
  if (locale === "de") return href;
  if (href === "/") return "/cs";
  return `/cs${href}`;
}

export const nav = {
  de: [
    { href: "/", label: "Home" },
    { href: "/sortiment", label: "Sortiment" },
    { href: "/aktuell", label: "Aktuell" },
    { href: "/kontakt", label: "Kontakt" },
  ],
  cs: [
    { href: "/", label: "Domů" },
    { href: "/sortiment", label: "Sortiment" },
    { href: "/aktuell", label: "Aktuálně" },
    { href: "/kontakt", label: "Kontakt" },
  ],
} as const;

export const copy = {
  de: {
    htmlLang: "de-AT",
    skip: "Zum Inhalt",
    menu: "Menü",
    offer: "Angebot anfragen",
    description:
      "Österreichischer Betrieb für die Übernahme, Zerlegung und den Handel von Wild und Fleisch. Frischwild, Wildspezialitäten und gekühlter Fachhandel in Untermarkersdorf.",
    claim: "Übernahme, Zerlegung und Handel aus dem Weinviertel",
    heroKicker: "Weinviertel · Seit 2005 · AT 30123 EG",
    heroTitle1: "Wild, das man",
    heroTitle2: "schmecken kann.",
    heroLead:
      "Willinger Wild und Fleisch GmbH ist ein österreichischer Betrieb für die Übernahme, Zerlegung und den Handel von Wild und Fleisch.",
    seeRange: "Sortiment ansehen",
    welcome: "Herzlich willkommen",
    welcomeTitle: "Handwerk aus Untermarkersdorf",
    welcomeP1:
      "Gerne übermitteln wir ein Angebot aus der eigenen Verarbeitung von Wildprodukten. Unsere Palette reicht von Frischwild – Hirsch, Reh, Feldhase, Fasan, Rebhuhn, Wildkaninchen, Gemse, Mufflon und mehr – über Wildgulasch, Würstel, Wurst, Käsewurst, Leberkäse und Leberpastete bis zum geräucherten Wildschinken.",
    welcomeP2:
      "Nach traditionellen Rezepten und mit viel Erfahrung werden zahlreiche Wildspezialitäten gekocht. Wir freuen uns auf Ihre Anfrage.",
    takeoverLink: "Wildübernahme & Verkauf →",
    fresh: "Frischwild",
    range: "Das Sortiment",
    allProducts: "Alle Produkte →",
    own: "Eigene Verarbeitung",
    specTitle: "Spezialitäten nach traditionellen Rezepten",
    why: "Warum Fachhandel",
    whyTitle: "Acht Gründe, hier zu kaufen",
    cta: "Wir freuen uns auf Ihre geschätzte Anfrage.",
    write: "Nachricht schreiben",
    visit: "Besuch & Anfrage",
    pages: "Seiten",
    controlled: "kontrolliert",
    since: "Seit",
    in: "in Untermarkersdorf.",
    sortimentKicker: "Eigene Verarbeitung",
    sortimentTitle: "Wild vom Stück bis zur Spezialität",
    sortimentLead:
      "Frischwild, Wurstwaren und Geräuchertes aus der eigenen Verarbeitung. Gerne erstellen wir ein passendes Angebot.",
    freshLead:
      "Hirsch, Reh, Feldhase, Fasan, Rebhuhn, Wildkaninchen, Gemse, Mufflon und Wildschwein – fachgerecht zerwirkt, kühl gehalten, klar deklariert.",
    specs: "Wildspezialitäten",
    getOffer: "Angebot einholen",
    aktuellKicker: "Aktuell",
    aktuellTitle: "Wildübernahme und Verkauf",
    aktuellLead:
      "Imbiss in Hadres, Wochenkarte und Wildübernahme in Untermarkersdorf – der Betrieb für Wildschwein, Hirsch, Reh, Hase, Fasan und Ente.",
    steps: [
      {
        title: "Annahme",
        text: "Wir übernehmen Wild in Untermarkersdorf – nach Absprache, mit klaren Hygiene- und Kühlvorgaben.",
      },
      {
        title: "Zerlegung",
        text: "Fachgerechte Zerwirkung durch den Zerlegebetrieb. Stücke, wie Küche und Handel sie brauchen.",
      },
      {
        title: "Verkauf",
        text: "Frischware und Spezialitäten für Gastronomie, Fachhandel und Abholung vor Ort.",
      },
    ],
    takeoverTitle: "Kontakt für Übernahme",
    takeoverText:
      "Termine bitte telefonisch oder per E-Mail abstimmen. Für Jäger und Lieferanten gilt: gekühlt, dokumentiert, veterinärrechtlich sauber.",
    kontaktKicker: "Kontakt",
    kontaktTitle: "Ein Angebot aus eigener Verarbeitung",
    kontaktLead:
      "Schreiben Sie uns Menge, Wunschtermin und ob Abholung oder gekühlter Transport gewünscht ist.",
    betrieb: "Betrieb",
    name: "Name",
    mail: "E-Mail",
    phone: "Telefon",
    optional: "(optional)",
    interest: "Interesse",
    message: "Nachricht",
    placeholder: "Menge, Wunschtermin, Abholung oder Lieferung…",
    send: "Anfrage senden",
    thanks: "Danke für Ihre Anfrage.",
    thanksText: "Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht an",
    legal: "Rechtliches",
    privacyP1:
      "Diese Website speichert keine Tracking-Cookies und betreibt keine Analyseprofile. Das Kontaktformular öffnet Ihr eigenes E-Mail-Programm. Es werden keine Formulardaten auf dem Server gespeichert.",
    privacyP2:
      "Wenn Sie uns per Telefon oder E-Mail kontaktieren, verarbeiten wir die angegebenen Daten ausschließlich zur Beantwortung Ihrer Anfrage und zur Abwicklung von Bestellungen oder Übernahmen.",
    privacyP3:
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und f DSGVO. Eine Weitergabe an Dritte erfolgt nicht, außer sie ist zur Vertragserfüllung oder gesetzlich erforderlich.",
    privacyP4:
      "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit sowie das Recht auf Beschwerde bei der österreichischen Datenschutzbehörde.",
    subject: "Anfrage von",
    notFound: "Seite nicht gefunden",
    home: "Zur Startseite",
    takeoverInterest: "Wildübernahme",
  },
  cs: {
    htmlLang: "cs",
    skip: "Přejít k obsahu",
    menu: "Menu",
    offer: "Poptat nabídku",
    description:
      "Rakouský provoz na výkup, bourání a obchod se zvěřinou a masem. Čerstvá zvěřina, speciality a chlazený velkoobchod v Untermarkersdorfu.",
    claim: "Výkup, bourání a obchod ze Weinviertelu",
    heroKicker: "Weinviertel · od 2005 · AT 30123 EG",
    heroTitle1: "Zvěřina,",
    heroTitle2: "kterou je cítit.",
    heroLead:
      "Willinger Wild und Fleisch GmbH je rakouský provoz na výkup, bourání a obchod se zvěřinou a masem.",
    seeRange: "Zobrazit sortiment",
    welcome: "Vítejte",
    welcomeTitle: "Řemeslo z Untermarkersdorfu",
    welcomeP1:
      "Rádi připravíme nabídku z vlastní výroby. Od čerstvé zvěřiny – jelen, srnec, zajíc, bažant, koroptev, králík, kamzík, muflon a další – přes guláš, klobásy, játrový sýr a paštiky až po uzenou šunku ze zvěřiny.",
    welcomeP2:
      "Podle tradičních receptů a se spoustou zkušeností vaříme řadu specialit. Těšíme se na poptávku.",
    takeoverLink: "Výkup zvěřiny a prodej →",
    fresh: "Čerstvá zvěřina",
    range: "Sortiment",
    allProducts: "Všechny produkty →",
    own: "Vlastní výroba",
    specTitle: "Speciality podle tradičních receptů",
    why: "Proč od nás",
    whyTitle: "Osm důvodů, proč kupovat tady",
    cta: "Těšíme se na vaši poptávku.",
    write: "Napsat zprávu",
    visit: "Návštěva a poptávka",
    pages: "Stránky",
    controlled: "kontrolováno",
    since: "Od",
    in: "v Untermarkersdorfu.",
    sortimentKicker: "Vlastní výroba",
    sortimentTitle: "Zvěřina od kusu po specialitu",
    sortimentLead:
      "Čerstvá zvěřina, uzeniny a uzené z vlastní výroby. Rádi sestavíme nabídku.",
    freshLead:
      "Jelen, srnec, zajíc, bažant, koroptev, králík, kamzík, muflon a divočák – odborně bouráno, chlazeno, jasně označené.",
    specs: "Speciality ze zvěřiny",
    getOffer: "Nechat si poslat nabídku",
    aktuellKicker: "Aktuálně",
    aktuellTitle: "Výkup zvěřiny a prodej",
    aktuellLead:
      "Občerstvení v Hadres, týdenní menu a výkup zvěřiny v Untermarkersdorfu – divočák, jelen, srnec, zajíc, bažant a kachna.",
    steps: [
      {
        title: "Příjem",
        text: "Zvěřinu přebíráme v Untermarkersdorfu – po dohodě, s jasnými hygienickými a chladicími pravidly.",
      },
      {
        title: "Bourání",
        text: "Odborné bourání v bourárně. Porce, jaké potřebuje kuchyně i obchod.",
      },
      {
        title: "Prodej",
        text: "Čerstvé zboží a speciality pro gastronomii, velkoobchod i osobní odběr.",
      },
    ],
    takeoverTitle: "Kontakt pro výkup",
    takeoverText:
      "Termíny prosím telefonicky nebo e-mailem. Pro myslivce a dodavatele: chlazené, zdokumentované, veterinárně v pořádku.",
    kontaktKicker: "Kontakt",
    kontaktTitle: "Nabídka z vlastní výroby",
    kontaktLead:
      "Napište množství, termín a zda chcete odběr, nebo chlazenou dopravu.",
    betrieb: "Provoz",
    name: "Jméno",
    mail: "E-mail",
    phone: "Telefon",
    optional: "(volitelné)",
    interest: "Zájem",
    message: "Zpráva",
    placeholder: "Množství, termín, odběr nebo dovoz…",
    send: "Odeslat poptávku",
    thanks: "Děkujeme za poptávku.",
    thanksText: "Otevře se e-mail s připravenou zprávou na",
    legal: "Právní informace",
    privacyP1:
      "Tento web neukládá sledovací cookies a neprovozuje analytické profily. Kontaktní formulář otevře váš e-mail. Data z formuláře se na serveru neukládají.",
    privacyP2:
      "Když nám napíšete nebo zavoláte, údaje použijeme jen k odpovědi a k vyřízení objednávky nebo výkupu.",
    privacyP3:
      "Právní základ je čl. 6 odst. 1 písm. b a f GDPR. Třetím stranám je nepředáváme, ledaže to vyžaduje smlouva nebo zákon.",
    privacyP4:
      "Máte právo na přístup, opravu, výmaz, omezení, námitku, přenositelnost a stížnost u rakouského úřadu pro ochranu osobních údajů.",
    subject: "Poptávka od",
    notFound: "Stránka nenalezena",
    home: "Zpět na úvod",
    takeoverInterest: "Výkup zvěřiny",
  },
} as const;

export const game = {
  de: [
    { name: "Hirsch", note: "Frischwild" },
    { name: "Reh", note: "Frischwild" },
    { name: "Wildschwein", note: "Frischwild" },
    { name: "Feldhase", note: "Frischwild" },
    { name: "Fasan", note: "Geflügel" },
    { name: "Rebhuhn", note: "Geflügel" },
    { name: "Wildkaninchen", note: "Frischwild" },
    { name: "Gemse", note: "Frischwild" },
    { name: "Mufflon", note: "Frischwild" },
  ],
  cs: [
    { name: "Jelen", note: "Čerstvá zvěřina" },
    { name: "Srnec", note: "Čerstvá zvěřina" },
    { name: "Divočák", note: "Čerstvá zvěřina" },
    { name: "Zajíc", note: "Čerstvá zvěřina" },
    { name: "Bažant", note: "Drůbež" },
    { name: "Koroptev", note: "Drůbež" },
    { name: "Králík", note: "Čerstvá zvěřina" },
    { name: "Kamzík", note: "Čerstvá zvěřina" },
    { name: "Muflon", note: "Čerstvá zvěřina" },
  ],
} as const;

export const specialties = {
  de: [
    {
      name: "Wildgulasch",
      text: "Langsam gegart nach traditionellen Rezepten – bereit für die Küche.",
      image: "/images/sausages.jpg",
    },
    {
      name: "Wildwürstel & Wildwurst",
      text: "Würzig, saftig, aus eigener Verarbeitung – inklusive Käsewurst.",
      image: "/images/charcuterie.jpg",
    },
    {
      name: "Wildleberkäse & Pastete",
      text: "Feine Aufstriche und Leberkäse aus Wild, mit viel Erfahrung gemacht.",
      image: "/images/grill.jpg",
    },
    {
      name: "Geräucherter Wildschinken",
      text: "Ruhig geräuchert, fest in der Struktur, klar im Geschmack.",
      image: "/images/steak.jpg",
    },
  ],
  cs: [
    {
      name: "Guláš ze zvěřiny",
      text: "Pomalu dušený podle tradičních receptů – připravený do kuchyně.",
      image: "/images/sausages.jpg",
    },
    {
      name: "Klobásy a salámy ze zvěřiny",
      text: "Kořeněné, šťavnaté, z vlastní výroby – včetně sýrové klobásy.",
      image: "/images/charcuterie.jpg",
    },
    {
      name: "Játrový sýr a paštika",
      text: "Jemné pomazánky a játrový sýr ze zvěřiny, s dlouholetou zkušeností.",
      image: "/images/grill.jpg",
    },
    {
      name: "Uzená šunka ze zvěřiny",
      text: "Klidně uzená, pevná ve struktuře, čistá v chuti.",
      image: "/images/steak.jpg",
    },
  ],
} as const;

export const reasons = {
  de: [
    { n: "01", title: "Tierärztlich kontrolliert", text: "Garantiert kontrollierte Ware – nachvollziehbar und sicher." },
    { n: "02", title: "Garantierte Frische", text: "Kurze Wege, klare Kühlkette, kein Kompromiss bei der Qualität." },
    { n: "03", title: "Fachgerechte Zerwirkung", text: "Wildfleisch wird von Profis zerwirkt – sauber, ergiebig, küchengerecht." },
    { n: "04", title: "Große Auswahl", text: "Von Frischwild bis zu Würsten, Pasteten und geräuchertem Schinken." },
    { n: "05", title: "Fachliche Beratung", text: "Welche Stücke, welche Menge, welche Zubereitung – wir helfen gerne." },
    { n: "06", title: "Optimale Verpackung", text: "Sauber portioniert und verpackt, bereit für Lager, Küche oder Verkauf." },
    { n: "07", title: "Gekühlter Transport", text: "Fachgerechte Kühlung und gekühlter Transport bis zur Übergabe." },
    { n: "08", title: "Faire Preise", text: "Klare Konditionen für Jäger, Gastronomie und den Fachhandel." },
  ],
  cs: [
    { n: "01", title: "Veterinární kontrola", text: "Garantovaně kontrolované zboží – dohledatelné a bezpečné." },
    { n: "02", title: "Zaručená čerstvost", text: "Krátké cesty, jasný chladicí řetězec, žádný kompromis v kvalitě." },
    { n: "03", title: "Odborné bourání", text: "Zvěřinu bourají profíci – čistě, výtěžně, připravené do kuchyně." },
    { n: "04", title: "Velký výběr", text: "Od čerstvé zvěřiny po klobásy, paštiky a uzenou šunku." },
    { n: "05", title: "Odborná rada", text: "Jaké kusy, kolik a jak připravit – rádi poradíme." },
    { n: "06", title: "Správné balení", text: "Čistě naporcované a zabalené, připravené do skladu, kuchyně i prodeje." },
    { n: "07", title: "Chlazená doprava", text: "Odborné chlazení a chlazený transport až k předání." },
    { n: "08", title: "Férové ceny", text: "Jasné podmínky pro myslivce, gastronomii i velkoobchod." },
  ],
} as const;
