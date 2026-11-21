/**
 * The eight rounds, in play order.
 *
 * The first clue of a round is free, the rest cost points; the order is chosen
 * so that the free card narrows the field a little but never gives the answer
 * away. Every round's six clues together identify exactly one country of the
 * pool, which `tests/data.test.ts` checks.
 */

import type { ClueKind } from "../game";

export type Round = {
  /** Country id from `data/countries.ts`. */
  country: string;
  clues: ClueKind[];
};

export const ROUNDS: Round[] = [
  {
    country: "japan",
    clues: ["tv", "mains", "driving", "emergency", "date", "plug"],
  },
  {
    country: "brasilien",
    clues: ["numbers", "plug", "mains", "emergency", "date", "tv"],
  },
  {
    country: "suedafrika",
    clues: ["driving", "plug", "emergency", "mains", "numbers", "tv"],
  },
  {
    country: "indien",
    clues: ["numbers", "plug", "driving", "emergency", "date", "mains"],
  },
  {
    country: "saudi-arabien",
    clues: ["plug", "mains", "emergency", "date", "tv", "week"],
  },
  {
    country: "oesterreich",
    clues: ["date", "emergency", "plug", "numbers", "units", "tv"],
  },
  {
    country: "frankreich",
    clues: ["tv", "emergency", "plug", "date", "numbers", "week"],
  },
  {
    country: "aethiopien",
    clues: ["mains", "emergency", "date", "plug", "tv", "numbers"],
  },
];
