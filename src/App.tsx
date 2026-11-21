import { useState } from "react";
import { ClueCard } from "./components/ClueCard";
import { GuessBox } from "./components/GuessBox";
import { RevealPanel } from "./components/RevealPanel";
import { ScoreScreen } from "./components/ScoreScreen";
import { COUNTRY_BY_ID, type Country } from "./data/countries";
import { ROUNDS, type Round } from "./data/rounds";
import {
  BASE_POINTS,
  CLUE_COST,
  type ClueKind,
  MAX_GUESSES,
  roundPoints,
  totalScore,
} from "./game";
import type { RoundResult } from "./types";

type Phase = "play" | "reveal" | "score";

function roundAt(index: number): { round: Round; answer: Country } {
  const round = ROUNDS[index] ?? ROUNDS[0];
  if (!round) throw new Error("keine Runden definiert");
  const answer = COUNTRY_BY_ID.get(round.country);
  if (!answer) throw new Error(`unbekanntes Land: ${round.country}`);
  return { round, answer };
}

function firstClue(index: number): ClueKind[] {
  const kind = ROUNDS[index]?.clues[0];
  return kind ? [kind] : [];
}

export function App() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("play");
  const [revealed, setRevealed] = useState<ClueKind[]>(() => firstClue(0));
  const [guesses, setGuesses] = useState<Country[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [points, setPoints] = useState(0);

  const { round, answer } = roundAt(roundIndex);
  const running = totalScore(results.map((result) => result.points));

  const reveal = (kind: ClueKind) => {
    if (phase !== "play" || revealed.includes(kind)) return;
    setRevealed((list) => [...list, kind]);
  };

  const finish = (earned: number, misses: number) => {
    setPoints(earned);
    setResults((list) => [
      ...list,
      { country: answer, points: earned, hints: revealed.length, misses },
    ]);
    setPhase("reveal");
  };

  const guess = (country: Country) => {
    if (phase !== "play") return;
    if (country.id === answer.id) {
      finish(roundPoints(revealed.length, guesses.length), guesses.length);
      return;
    }
    const misses = guesses.length + 1;
    setGuesses((list) => [...list, country]);
    if (misses >= MAX_GUESSES) finish(0, misses);
  };

  const next = () => {
    if (roundIndex + 1 >= ROUNDS.length) {
      setPhase("score");
      return;
    }
    const index = roundIndex + 1;
    setRoundIndex(index);
    setRevealed(firstClue(index));
    setGuesses([]);
    setPhase("play");
  };

  const restart = () => {
    setRoundIndex(0);
    setRevealed(firstClue(0));
    setGuesses([]);
    setResults([]);
    setPoints(0);
    setPhase("play");
  };

  if (phase === "score") {
    return (
      <main className="shell">
        <ScoreScreen results={results} onRestart={restart} />
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1 className="title">Landesprobe</h1>
          <p className="tagline">
            Acht Länder, sechs Hinweise. Rate das Land an seinem Alltag:
            Steckdose, Notruf, Datumsformat, Farbfernsehen.
          </p>
        </div>
        <div className="score-badge">
          <span className="score-value mono">{running}</span>
          <span className="score-label">von {ROUNDS.length * BASE_POINTS}</span>
        </div>
      </header>

      <p className="round-line">
        Runde <span className="mono">{roundIndex + 1}</span> von{" "}
        <span className="mono">{ROUNDS.length}</span>
      </p>

      <section className="clues" aria-label="Hinweise">
        {round.clues.map((kind, index) => (
          <ClueCard
            key={kind}
            kind={kind}
            number={index + 1}
            country={revealed.includes(kind) ? answer : null}
            cost={CLUE_COST}
            onReveal={() => reveal(kind)}
          />
        ))}
      </section>

      {phase === "play" ? (
        <GuessBox
          answer={answer}
          revealed={revealed}
          guesses={guesses}
          attemptsLeft={MAX_GUESSES - guesses.length}
          onGuess={guess}
        />
      ) : (
        <RevealPanel
          answer={answer}
          clues={round.clues}
          points={points}
          hints={revealed.length}
          misses={guesses.length}
          isLast={roundIndex + 1 >= ROUNDS.length}
          onNext={next}
        />
      )}

      <footer className="rules">
        Der erste Hinweis ist frei, jeder weitere kostet {CLUE_COST} Punkte. Ein
        Fehltipp kostet 400, nach {MAX_GUESSES} Fehltipps ist die Runde vorbei.
      </footer>
    </main>
  );
}
