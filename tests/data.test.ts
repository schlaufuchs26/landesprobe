import { describe, expect, test } from "bun:test";
import { COUNTRIES, COUNTRY_BY_ID } from "../src/data/countries";
import { ROUNDS } from "../src/data/rounds";
import { type ClueKind, clueText } from "../src/game";

const signature = (id: string, kinds: ClueKind[]): string => {
  const country = COUNTRY_BY_ID.get(id);
  if (!country) throw new Error(`unknown country: ${id}`);
  return kinds.map((kind) => clueText(country, kind)).join("|");
};

describe("the pool", () => {
  test("every country is complete", () => {
    for (const country of COUNTRIES) {
      expect(country.id).toMatch(/^[a-z-]+$/);
      expect(country.name.length).toBeGreaterThan(2);
      expect(country.plug.length).toBeGreaterThan(0);
      expect(country.volts.length).toBeGreaterThan(0);
      expect(country.hertz.length).toBeGreaterThan(0);
      expect(country.emergency.length).toBeGreaterThan(0);
      for (const number of country.emergency) expect(number).toMatch(/^\d+$/);
      expect(["C", "F"]).toContain(country.temp);
      expect(["km/h", "mph"]).toContain(country.speed);
    }
  });

  test("ids are unique and there are enough countries to guess from", () => {
    const ids = new Set(COUNTRIES.map((country) => country.id));
    expect(ids.size).toBe(COUNTRIES.length);
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(40);
  });
});

describe("the rounds", () => {
  test("there are eight, each with six distinct clues", () => {
    expect(ROUNDS.length).toBe(8);
    for (const round of ROUNDS) {
      expect(round.clues.length).toBe(6);
      expect(new Set(round.clues).size).toBe(6);
    }
  });

  test("no country is asked twice", () => {
    const ids = ROUNDS.map((round) => round.country);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every round has a country in the pool and a fact to tell", () => {
    for (const round of ROUNDS) {
      const country = COUNTRY_BY_ID.get(round.country);
      expect(country).toBeDefined();
      expect(country?.fact?.length ?? 0).toBeGreaterThan(60);
    }
  });

  // The whole point of a round: the six clues together leave exactly one
  // country of the pool. Without this the player could be right and still lose.
  test("a round's six clues identify exactly one country", () => {
    for (const round of ROUNDS) {
      const answer = signature(round.country, round.clues);
      const matches = COUNTRIES.filter(
        (country) => signature(country.id, round.clues) === answer,
      );
      expect(matches.map((country) => country.id)).toEqual([round.country]);
    }
  });

  test("the free clue alone does not give the answer away", () => {
    for (const round of ROUNDS) {
      const free = round.clues[0];
      if (!free) throw new Error("round without clues");
      const answer = signature(round.country, [free]);
      const matches = COUNTRIES.filter(
        (country) => signature(country.id, [free]) === answer,
      );
      expect(matches.length).toBeGreaterThan(1);
    }
  });
});
