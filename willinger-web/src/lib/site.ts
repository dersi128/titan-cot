export const site = {
  name: "Willinger Wild und Fleisch GmbH",
  shortName: "Willinger",
  tagline: "Wild und Fleisch",
  claim: "Übernahme, Zerlegung und Handel aus dem Weinviertel",
  description:
    "Österreichischer Betrieb für die Übernahme, Zerlegung und den Handel von Wild und Fleisch. Frischwild, Wildspezialitäten und gekühlter Fachhandel in Untermarkersdorf.",
  founded: 2005,
  vetMark: "AT 30123 EG",
  address: {
    street: "Untermarkersdorf 25",
    zip: "2061",
    city: "Hadres",
    region: "Weinviertel, Niederösterreich",
    country: "Österreich",
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

export const nav = [
  { href: "/", label: "Home" },
  { href: "/sortiment", label: "Sortiment" },
  { href: "/aktuell", label: "Aktuell" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const game = [
  { name: "Hirsch", note: "Frischwild" },
  { name: "Reh", note: "Frischwild" },
  { name: "Wildschwein", note: "Frischwild" },
  { name: "Feldhase", note: "Frischwild" },
  { name: "Fasan", note: "Geflügel" },
  { name: "Rebhuhn", note: "Geflügel" },
  { name: "Wildkaninchen", note: "Frischwild" },
  { name: "Gemse", note: "Frischwild" },
  { name: "Mufflon", note: "Frischwild" },
] as const;

export const specialties = [
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
] as const;

export const reasons = [
  {
    n: "01",
    title: "Tierärztlich kontrolliert",
    text: "Garantiert kontrollierte Ware – nachvollziehbar und sicher.",
  },
  {
    n: "02",
    title: "Garantierte Frische",
    text: "Kurze Wege, klare Kühlkette, kein Kompromiss bei der Qualität.",
  },
  {
    n: "03",
    title: "Fachgerechte Zerwirkung",
    text: "Wildfleisch wird von Profis zerwirkt – sauber, ergiebig, küchengerecht.",
  },
  {
    n: "04",
    title: "Große Auswahl",
    text: "Von Frischwild bis zu Würsten, Pasteten und geräuchertem Schinken.",
  },
  {
    n: "05",
    title: "Fachliche Beratung",
    text: "Welche Stücke, welche Menge, welche Zubereitung – wir helfen gerne.",
  },
  {
    n: "06",
    title: "Optimale Verpackung",
    text: "Sauber portioniert und verpackt, bereit für Lager, Küche oder Verkauf.",
  },
  {
    n: "07",
    title: "Gekühlter Transport",
    text: "Fachgerechte Kühlung und gekühlter Transport bis zur Übergabe.",
  },
  {
    n: "08",
    title: "Faire Preise",
    text: "Klare Konditionen für Jäger, Gastronomie und den Fachhandel.",
  },
] as const;
