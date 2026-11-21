import { useState } from "react";
import type { Country } from "../data/countries";
import {
  CLUE_TITLE,
  type ClueKind,
  clueText,
  searchCountries,
  type Verdict,
  verdict,
} from "../game";

type Props = {
  answer: Country;
  revealed: ClueKind[];
  guesses: Country[];
  attemptsLeft: number;
  onGuess: (country: Country) => void;
};

const MARK: Record<Verdict, string> = { match: "✓", close: "≈", off: "✗" };
const MARK_LABEL: Record<Verdict, string> = {
  match: "stimmt",
  close: "ähnlich",
  off: "anders",
};

export function GuessBox({
  answer,
  revealed,
  guesses,
  attemptsLeft,
  onGuess,
}: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const suggestions = searchCountries(query);

  const submit = (country: Country) => {
    setQuery("");
    setActive(0);
    onGuess(country);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const pick = suggestions[active];
      if (pick) {
        event.preventDefault();
        submit(pick);
      }
    }
  };

  return (
    <section className="guessbox">
      <label className="guess-label" htmlFor="country-guess">
        Welches Land?
      </label>
      <div className="typeahead">
        <input
          id="country-guess"
          className="guess-input"
          value={query}
          autoComplete="off"
          placeholder="Land eintippen …"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        {suggestions.length > 0 ? (
          <div className="suggestions" role="listbox" aria-label="Länder">
            {suggestions.map((country, index) => (
              <button
                key={country.id}
                type="button"
                role="option"
                aria-selected={index === active}
                className={
                  index === active ? "suggestion active" : "suggestion"
                }
                onClick={() => submit(country)}
              >
                <span aria-hidden="true">{country.flag}</span> {country.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="attempts">
        {attemptsLeft === 1
          ? "Letzter Versuch."
          : `${attemptsLeft} Versuche, ein Tipp kostet 400 Punkte.`}
      </p>

      {guesses.length > 0 ? (
        <ol className="guess-list">
          {guesses.map((guess, index) => (
            // The list only grows, and the same country may be guessed twice,
            // so the position is the identity here.
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
            <li key={`${guess.id}-${index}`} className="guess">
              <p className="guess-name">
                Tipp {index + 1}: {guess.flag} {guess.name}
              </p>
              <ul className="marks">
                {revealed.map((kind) => {
                  const mark = verdict(kind, guess, answer);
                  return (
                    <li key={kind} className={`mark ${mark}`}>
                      <span aria-hidden="true">{MARK[mark]}</span>
                      <span className="sr-only">{MARK_LABEL[mark]}</span>
                      <span className="mark-clue">{CLUE_TITLE[kind]}</span>
                      <span className="mark-value">
                        {clueText(guess, kind)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
