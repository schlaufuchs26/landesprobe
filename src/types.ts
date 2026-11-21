import type { Country } from "./data/countries";

/** One finished round, as the score screen needs it. */
export type RoundResult = {
  country: Country;
  points: number;
  hints: number;
  misses: number;
};
