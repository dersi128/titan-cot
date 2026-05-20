import type { Locale } from "./TitanI18n";
import type { PositioningTrend } from "../lib/titanCotScore";

const LABELS: Record<string, { en: string; cs: string }> = {
  Neutral: { en: "Neutral", cs: "Neutrální" },
  "Strong Bullish": { en: "Strong Bullish", cs: "Silně býčí" },
  "Strong Bearish": { en: "Strong Bearish", cs: "Silně medvědí" },
  "Moderate Bullish": { en: "Moderate Bullish", cs: "Mírně býčí" },
  "Moderate Bearish": { en: "Moderate Bearish", cs: "Mírně medvědí" },
  "Accumulation Phase": { en: "Accumulation Phase", cs: "Fáze akumulace" },
  "Distribution Phase": { en: "Distribution Phase", cs: "Fáze distribuce" },
  "Crowded Long": { en: "Crowded Long", cs: "Přeplněné longy" },
  "Crowded Short": { en: "Crowded Short", cs: "Přeplněné shorty" },
  Exhaustion: { en: "Exhaustion", cs: "Vyčerpání" },
  "Aggressive Accumulation": { en: "Aggressive Accumulation", cs: "Agresivní akumulace" },
  "Aggressive Distribution": { en: "Aggressive Distribution", cs: "Agresivní distribuce" },
  "Passive Accumulation": { en: "Passive Accumulation", cs: "Pasivní akumulace" },
  "Passive Distribution": { en: "Passive Distribution", cs: "Pasivní distribuce" },
  accumulation: { en: "accumulation", cs: "akumulace" },
  distribution: { en: "distribution", cs: "distribuce" },
  flat: { en: "flat", cs: "flat" },
  ACCUMULATION: { en: "Accumulation", cs: "Akumulace" },
  DISTRIBUTION: { en: "Distribution", cs: "Distribuce" },
  TRENDING: { en: "Trending", cs: "Trend" },
  ROTATION: { en: "Rotation", cs: "Rotace" },
  EXHAUSTION: { en: "Exhaustion", cs: "Vyčerpání" },
  TRANSITION: { en: "Transition", cs: "Přechod" },
  NEUTRAL: { en: "Neutral", cs: "Neutrální" },
};

export function translateApiLabel(value: string, locale: Locale): string {
  const hit = LABELS[value];
  if (hit) return locale === "cs" ? hit.cs : hit.en;
  return value;
}

export function translateTrend(trend: PositioningTrend, locale: Locale, t: (k: string) => string): string {
  if (trend === "accumulation") return t("scoring.trendAccumulation");
  if (trend === "distribution") return t("scoring.trendDistribution");
  return t("scoring.trendFlat");
}
