import type { Country } from "../data/countries";
import { CLUE_TITLE, type ClueKind, clueText } from "../game";

type Props = {
  answer: Country;
  clues: ClueKind[];
  points: number;
  hints: number;
  misses: number;
  isLast: boolean;
  onNext: () => void;
};

export function RevealPanel({
  answer,
  clues,
  points,
  hints,
  misses,
  isLast,
  onNext,
}: Props) {
  return (
    <section className="reveal" data-testid="reveal">
      <p className="reveal-label">Es war</p>
      <h2 className="reveal-name">
        <span aria-hidden="true">{answer.flag}</span> {answer.name}
      </h2>
      <p className="reveal-points">
        {points} Punkte · {hints === 1 ? "1 Hinweis" : `${hints} Hinweise`} ·{" "}
        {misses === 0
          ? "ohne Fehltipp"
          : `${misses} Fehltipp${misses > 1 ? "s" : ""}`}
      </p>
      {answer.fact ? <p className="reveal-fact">{answer.fact}</p> : null}
      <ul className="reveal-clues">
        {clues.map((kind) => (
          <li key={kind}>
            <span className="reveal-clue">{CLUE_TITLE[kind]}</span>
            <span className="reveal-value mono">{clueText(answer, kind)}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="primary" onClick={onNext}>
        {isLast ? "Zur Auswertung" : "Nächstes Land"}
      </button>
    </section>
  );
}
