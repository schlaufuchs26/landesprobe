import { describe, expect, test } from "bun:test";
import { COUNTRY_BY_ID } from "../src/data/countries";
import {
  BASE_POINTS,
  CLUE_COST,
  clueText,
  dateExample,
  formatNumberSample,
  MAX_GUESSES,
  mainsLabel,
  roundPoints,
  searchCountries,
  totalScore,
  verdict,
  verdictText,
  WRONG_COST,
} from "../src/game";

function country(id: string) {
  const found = COUNTRY_BY_ID.get(id);
  if (!found) throw new Error(`unknown country in test: ${id}`);
  return found;
}

describe("round scoring", () => {
  test("a clean first guess pays the full round", () => {
    expect(roundPoints(1, 0)).toBe(BASE_POINTS);
  });

  test("every extra clue and every miss costs", () => {
    expect(roundPoints(2, 0)).toBe(BASE_POINTS - CLUE_COST);
    expect(roundPoints(1, 1)).toBe(BASE_POINTS - WRONG_COST);
    expect(roundPoints(3, 1)).toBe(BASE_POINTS - 2 * CLUE_COST - WRONG_COST);
  });

  test("more hints never pay more, and the round never goes negative", () => {
    for (let hints = 1; hints <= 6; hints++) {
      for (let misses = 0; misses <= MAX_GUESSES; misses++) {
        const points = roundPoints(hints, misses);
        expect(points).toBeGreaterThanOrEqual(0);
        if (hints > 1) {
          expect(points).toBeLessThanOrEqual(roundPoints(hints - 1, misses));
        }
        if (misses > 0) {
          expect(points).toBeLessThanOrEqual(roundPoints(hints, misses - 1));
        }
      }
    }
  });

  test("a round with everything opened and three misses is worth nothing", () => {
    expect(roundPoints(6, 3)).toBe(0);
    expect(roundPoints(6, 9)).toBe(0);
  });

  test("the total is the sum of the rounds", () => {
    expect(totalScore([1000, 600, 0])).toBe(1600);
    expect(totalScore([])).toBe(0);
  });
});

describe("clue rendering", () => {
  test("dates follow the country's order", () => {
    expect(dateExample(country("japan"))).toBe("2026/12/31");
    expect(dateExample(country("usa"))).toBe("12/31/2026");
    expect(dateExample(country("deutschland"))).toBe("31.12.2026");
    expect(dateExample(country("schweden"))).toBe("2026-12-31");
  });

  test("digit grouping and decimal separator differ", () => {
    expect(formatNumberSample(country("deutschland"))).toBe("1.234.567,89");
    expect(formatNumberSample(country("usa"))).toBe("1,234,567.89");
    expect(formatNumberSample(country("indien"))).toBe("12,34,567.89");
  });

  test("Japan's two grid frequencies are both named", () => {
    expect(mainsLabel(country("japan"))).toBe("100 V · 50 / 60 Hz");
  });
});

describe("comparing a guess with the answer", () => {
  const japan = country("japan");
  const usa = country("usa");

  test("a country matches itself on every clue", () => {
    for (const kind of ["plug", "mains", "driving", "tv"] as const) {
      expect(verdict(kind, japan, japan)).toBe("match");
    }
  });

  test("a shared plug type is close, an unrelated one is off", () => {
    // Japan and the US share type A/B.
    expect(clueText(usa, "plug")).toBe(clueText(japan, "plug"));
    expect(verdict("plug", country("indien"), japan)).toBe("off");
    expect(verdict("plug", country("brasilien"), country("suedafrika"))).toBe(
      "close",
    );
  });

  test("a shared emergency number counts as close", () => {
    expect(verdict("emergency", country("irland"), country("uk"))).toBe(
      "close",
    );
    expect(verdict("emergency", country("usa"), country("uk"))).toBe("off");
  });

  test("a shared voltage or frequency is close", () => {
    expect(verdict("mains", country("mexiko"), country("usa"))).toBe("close");
    expect(verdict("mains", country("saudi-arabien"), country("uk"))).toBe(
      "close",
    );
    expect(verdict("mains", country("deutschland"), country("usa"))).toBe(
      "off",
    );
  });
});

describe("the type-ahead", () => {
  test("finds countries by prefix", () => {
    expect(searchCountries("fran")[0]?.id).toBe("frankreich");
  });

  test("ignores case and umlauts", () => {
    expect(searchCountries("oster")[0]?.id).toBe("oesterreich");
    expect(searchCountries("SUDA")[0]?.id).toBe("suedafrika");
  });

  test("accepts the names people actually type", () => {
    expect(searchCountries("usa")[0]?.id).toBe("usa");
    expect(searchCountries("england")[0]?.id).toBe("uk");
  });

  test("an empty query suggests nothing", () => {
    expect(searchCountries("")).toEqual([]);
    expect(searchCountries("   ")).toEqual([]);
  });

  test("never suggests more than the limit", () => {
    expect(searchCountries("a").length).toBeLessThanOrEqual(6);
  });
});

describe("verdict text", () => {
  test("scales with the share of the maximum", () => {
    expect(verdictText(8000, 8000)).toContain("Landeskenner");
    expect(verdictText(0, 8000)).toContain("Kabel");
    expect(verdictText(0, 0)).toContain("Kabel");
  });
});
