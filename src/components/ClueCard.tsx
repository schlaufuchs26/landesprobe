import type { Country } from "../data/countries";
import {
  CLUE_TITLE,
  type ClueKind,
  dateExample,
  drivingLabel,
  formatNumberSample,
  mainsLabel,
  tvLabel,
  unitsLabel,
} from "../game";
import { PlugIcon } from "./PlugIcon";

type Props = {
  kind: ClueKind;
  /** 1-based position, shown so the player can talk about "Hinweis 3". */
  number: number;
  /** The answer's value; null while the card is still face down. */
  country: Country | null;
  cost: number;
  onReveal: () => void;
};

function Road({ country }: { country: Country }) {
  const left = country.driving === "left";
  const carX = left ? 46 : 74;
  return (
    <svg
      className="road"
      viewBox="0 0 120 64"
      role="img"
      aria-label={drivingLabel(country)}
    >
      <rect x="0" y="0" width="120" height="64" className="road-ground" />
      <rect
        x="10"
        y="8"
        width="100"
        height="48"
        rx="4"
        className="road-surface"
      />
      {[16, 32, 48, 64, 80, 96].map((y) => (
        <rect key={y} x="58" y={y} width="4" height="9" className="road-line" />
      ))}
      <rect
        x={carX}
        y="20"
        width="18"
        height="26"
        rx="4"
        className="road-car"
      />
      <rect
        x={carX + 3}
        y="25"
        width="12"
        height="6"
        rx="2"
        className="road-glass"
      />
    </svg>
  );
}

function ClueVisual({ kind, country }: { kind: ClueKind; country: Country }) {
  switch (kind) {
    case "plug":
      return (
        <div className="visual">
          <div className="plugs">
            {country.plug.map((type) => (
              <PlugIcon key={type} type={type} />
            ))}
          </div>
          <p className="value">Typ {country.plug.join(" / ")}</p>
        </div>
      );
    case "mains":
      return (
        <div className="visual">
          <p className="value big">{mainsLabel(country)}</p>
        </div>
      );
    case "driving":
      return (
        <div className="visual">
          <Road country={country} />
          <p className="value">{drivingLabel(country)}</p>
        </div>
      );
    case "emergency":
      return (
        <div className="visual">
          <div className="chips">
            {country.emergency.map((number) => (
              <span key={number} className="chip">
                {number}
              </span>
            ))}
          </div>
        </div>
      );
    case "date":
      return (
        <div className="visual">
          <p className="value big mono">{dateExample(country)}</p>
        </div>
      );
    case "numbers":
      return (
        <div className="visual">
          <p className="value big mono">{formatNumberSample(country)}</p>
        </div>
      );
    case "tv":
      return (
        <div className="visual">
          <span className="badge">{tvLabel(country)}</span>
        </div>
      );
    case "units":
      return (
        <div className="visual">
          <p className="value big">{unitsLabel(country)}</p>
        </div>
      );
    case "week":
      return (
        <div className="visual">
          <p className="value">{country.weekStart}</p>
        </div>
      );
  }
}

export function ClueCard({ kind, number, country, cost, onReveal }: Props) {
  if (!country) {
    return (
      <button type="button" className="card locked" onClick={onReveal}>
        <span className="card-head">
          Hinweis {number} <span className="card-cost">−{cost}</span>
        </span>
        <span className="card-locked">{CLUE_TITLE[kind]}</span>
        <span className="card-open">aufdecken</span>
      </button>
    );
  }
  return (
    <div className="card" data-testid={`clue-${kind}`}>
      <span className="card-head">
        Hinweis {number} · {CLUE_TITLE[kind]}
      </span>
      <ClueVisual kind={kind} country={country} />
    </div>
  );
}
