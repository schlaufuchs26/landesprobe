import { BASE_POINTS, totalScore, verdictText } from "../game";
import type { RoundResult } from "../types";

type Props = {
  results: RoundResult[];
  onRestart: () => void;
};

export function ScoreScreen({ results, onRestart }: Props) {
  const score = totalScore(results.map((result) => result.points));
  const maximum = results.length * BASE_POINTS;

  return (
    <section className="score-screen" data-testid="score">
      <p className="reveal-label">Auswertung</p>
      <h2 className="score-total" data-testid="score-total">
        {score} <span className="score-max">von {maximum}</span>
      </h2>
      <p className="score-verdict">{verdictText(score, maximum)}</p>
      <table className="score-table">
        <thead>
          <tr>
            <th scope="col">Land</th>
            <th scope="col">Punkte</th>
            <th scope="col">Hinweise</th>
            <th scope="col">Fehltipps</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.country.id}>
              <th scope="row">
                <span aria-hidden="true">{result.country.flag}</span>{" "}
                {result.country.name}
              </th>
              <td className="mono">{result.points}</td>
              <td className="mono">{result.hints}</td>
              <td className="mono">{result.misses}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="primary" onClick={onRestart}>
        Nochmal
      </button>
    </section>
  );
}
