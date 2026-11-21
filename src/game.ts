/**
 * Pure game logic: what a clue shows, how a wrong guess is scored, and how two
 * countries' answers compare. No React in here, so every rule is testable
 * without a browser.
 */

import type { Country } from "./data/countries";
import { COUNTRIES } from "./data/countries";

export type ClueKind =
  | "plug"
  | "mains"
  | "driving"
  | "emergency"
  | "date"
  | "numbers"
  | "tv"
  | "units"
  | "week";

export const BASE_POINTS = 1000;
/** Each clue beyond the free first one costs this much of the round's points. */
export const CLUE_COST = 120;
/** Each wrong guess costs this much; the third ends the round. */
export const WRONG_COST = 400;
export const MAX_GUESSES = 3;

export const CLUE_TITLE: Record<ClueKind, string> = {
  plug: "Steckdose",
  mains: "Netzspannung",
  driving: "Straßenseite",
  emergency: "Notruf",
  date: "Datumsformat",
  numbers: "Zahlenformat",
  tv: "Farbfernsehen",
  units: "Einheiten",
  week: "Wochenstart",
};

/** A round's points: the base minus the hints opened and the misses paid for. */
export function roundPoints(
  revealedClues: number,
  wrongGuesses: number,
): number {
  const hints = Math.max(0, revealedClues - 1);
  const misses = Math.min(wrongGuesses, MAX_GUESSES);
  return Math.max(0, BASE_POINTS - hints * CLUE_COST - misses * WRONG_COST);
}

export function dateExample(country: Country): string {
  const parts: Record<string, string> = {
    dd: "31",
    mm: "12",
    yyyy: "2026",
  };
  return country.date
    .split(/([./-])/)
    .map((part) => parts[part] ?? part)
    .join("");
}

/** 1234567.89 in the country's grouping and decimal separator. */
export function formatNumberSample(country: Country): string {
  const digits = "1234567";
  const groups: string[] = [];
  if (country.numbering === "indian") {
    groups.unshift(digits.slice(-3));
    let rest = digits.slice(0, -3);
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length > 0) groups.unshift(rest);
  } else {
    let rest = digits;
    while (rest.length > 3) {
      groups.unshift(rest.slice(-3));
      rest = rest.slice(0, -3);
    }
    groups.unshift(rest);
  }
  const thousand = country.decimal === "," ? "." : ",";
  return `${groups.join(thousand)}${country.decimal}89`;
}

export function mainsLabel(country: Country): string {
  const volts = country.volts.join(" / ");
  const hertz = country.hertz.join(" / ");
  return `${volts} V · ${hertz} Hz`;
}

export function drivingLabel(country: Country): string {
  return country.driving === "left" ? "Linksverkehr" : "Rechtsverkehr";
}

export function tvLabel(country: Country): string {
  return country.tv;
}

export function unitsLabel(country: Country): string {
  return `${country.temp === "C" ? "°C" : "°F"} · ${country.speed}`;
}

/** The value a clue card shows, as text (used for tests and for comparing). */
export function clueText(country: Country, kind: ClueKind): string {
  switch (kind) {
    case "plug":
      return country.plug.join("/");
    case "mains":
      return mainsLabel(country);
    case "driving":
      return drivingLabel(country);
    case "emergency":
      return country.emergency.join(" · ");
    case "date":
      return dateExample(country);
    case "numbers":
      return formatNumberSample(country);
    case "tv":
      return tvLabel(country);
    case "units":
      return unitsLabel(country);
    case "week":
      return country.weekStart;
  }
}

export type Verdict = "match" | "close" | "off";

const shares = (a: string[], b: string[]): boolean =>
  a.some((value) => b.includes(value));

/**
 * How a guessed country compares with the answer for one clue. "close" is the
 * interesting middle: a shared plug type, a shared emergency number, or one of
 * the two mains values agreeing.
 */
export function verdict(
  kind: ClueKind,
  guess: Country,
  answer: Country,
): Verdict {
  if (clueText(guess, kind) === clueText(answer, kind)) return "match";
  switch (kind) {
    case "plug":
      return shares(guess.plug, answer.plug) ? "close" : "off";
    case "emergency":
      return shares(guess.emergency, answer.emergency) ? "close" : "off";
    case "mains":
      return shares(guess.volts.map(String), answer.volts.map(String)) ||
        shares(guess.hertz.map(String), answer.hertz.map(String))
        ? "close"
        : "off";
    case "units":
      return guess.temp === answer.temp || guess.speed === answer.speed
        ? "close"
        : "off";
    case "date":
      return guess.decimal === answer.decimal ? "close" : "off";
    case "numbers":
      return guess.numbering === answer.numbering ? "close" : "off";
    default:
      return "off";
  }
}

/** Case, accents and punctuation do not matter when typing a country. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesQuery(country: Country, query: string): boolean {
  const needle = normalize(query);
  if (needle.length === 0) return false;
  if (normalize(country.name).includes(needle)) return true;
  return (country.aliases ?? []).some((alias) =>
    normalize(alias).includes(needle),
  );
}

export function searchCountries(query: string, limit = 6): Country[] {
  const needle = normalize(query);
  if (needle.length === 0) return [];
  const prefix: Country[] = [];
  const inside: Country[] = [];
  for (const country of COUNTRIES) {
    const name = normalize(country.name);
    if (name.startsWith(needle)) prefix.push(country);
    else if (matchesQuery(country, query)) inside.push(country);
  }
  return [...prefix, ...inside].slice(0, limit);
}

export function totalScore(points: number[]): number {
  return points.reduce((sum, value) => sum + value, 0);
}

export function verdictText(score: number, maximum: number): string {
  const share = maximum === 0 ? 0 : score / maximum;
  if (share >= 0.9)
    return "Landeskenner. Du liest Stromnetze wie andere Krimis.";
  if (share >= 0.7) return "Sicher unterwegs. Die Hinweise saßen.";
  if (share >= 0.45)
    return "Solide Probe. Ein paar Länder brauchen noch einen Blick.";
  if (share >= 0.2) return "Die Richtung stimmt, die Details noch nicht.";
  return "Nächstes Mal weniger raten, mehr Kabel lesen.";
}
