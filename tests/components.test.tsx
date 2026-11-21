import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "../src/App";
import { COUNTRY_BY_ID } from "../src/data/countries";
import { ROUNDS } from "../src/data/rounds";

function answerName(index: number): string {
  const round = ROUNDS[index];
  if (!round) throw new Error(`no round ${index}`);
  const country = COUNTRY_BY_ID.get(round.country);
  if (!country) throw new Error(`unknown country ${round.country}`);
  return country.name;
}

function guess(name: string) {
  fireEvent.change(screen.getByLabelText("Welches Land?"), {
    target: { value: name },
  });
  const option = screen.getAllByRole("option")[0];
  if (!option) throw new Error(`no suggestion for ${name}`);
  fireEvent.click(option);
}

describe("a round", () => {
  test("opens with one free clue and five face-down cards", () => {
    render(<App />);
    expect(screen.getByText("Landesprobe")).toBeTruthy();
    expect(screen.getByTestId("clue-tv")).toBeTruthy();
    expect(screen.getByText("NTSC")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /aufdecken/ }).length).toBe(5);
  });

  test("opening a clue flips its card", () => {
    render(<App />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /aufdecken/ })[0] as HTMLElement,
    );
    expect(screen.getAllByRole("button", { name: /aufdecken/ }).length).toBe(4);
    expect(screen.getByTestId("clue-mains")).toBeTruthy();
    expect(screen.getByText(/100 V · 50 \/ 60 Hz/)).toBeTruthy();
  });

  test("a wrong guess is compared clue by clue", () => {
    render(<App />);
    guess("Frankreich");
    expect(screen.getByText(/Tipp 1:.*Frankreich/)).toBeTruthy();
    // The open card shows NTSC, France ran SECAM: the mark names the guess.
    expect(screen.getByText("SECAM")).toBeTruthy();
  });

  test("a correct guess reveals the country and its story", () => {
    render(<App />);
    guess("Japan");
    expect(screen.getByTestId("reveal")).toBeTruthy();
    expect(screen.getByText(/Es war/)).toBeTruthy();
    expect(screen.getByText(/Meiji-Zeit/)).toBeTruthy();
    expect(screen.getByText(/1000 Punkte/)).toBeTruthy();
  });
});

describe("a full game", () => {
  test("opening every clue of every round and guessing right ends on the score screen", () => {
    render(<App />);
    for (let index = 0; index < ROUNDS.length; index++) {
      const round = ROUNDS[index];
      if (!round) throw new Error(`no round ${index}`);
      for (const kind of round.clues) {
        if (!screen.queryByTestId(`clue-${kind}`)) {
          const locked = screen.getAllByRole("button", { name: /aufdecken/ });
          const next = locked[0];
          if (!next) throw new Error(`round ${index} has no locked card left`);
          fireEvent.click(next);
        }
        expect(screen.getByTestId(`clue-${kind}`)).toBeTruthy();
      }
      guess(answerName(index));
      const last = index === ROUNDS.length - 1;
      fireEvent.click(
        screen.getByRole("button", {
          name: last ? "Zur Auswertung" : "Nächstes Land",
        }),
      );
    }
    expect(screen.getByTestId("score")).toBeTruthy();
    // Six clues per round leave 1000 - 5 * 120 = 400 points each.
    expect(screen.getByTestId("score-total").textContent).toContain(
      "3200 von 8000",
    );
    fireEvent.click(screen.getByRole("button", { name: "Nochmal" }));
    expect(screen.getByText(/^Runde/)).toBeTruthy();
  });
});

describe("the guess box", () => {
  test("arrow keys and Enter pick a suggestion", () => {
    render(<App />);
    const input = screen.getByLabelText("Welches Land?");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText(/Tipp 1:/)).toBeTruthy();
  });

  test("a country typed without umlauts still submits", () => {
    render(<App />);
    guess("Osterreich");
    expect(screen.getByText(/Tipp 1:.*Österreich/)).toBeTruthy();
  });
});
