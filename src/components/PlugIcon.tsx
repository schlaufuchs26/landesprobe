import type { PlugType } from "../data/countries";

/**
 * A socket face for each IEC plug type: the shape is the clue, so the drawing
 * has to be recognisable at 64 px. Coordinates live in a 100 × 100 box.
 */
type Hole =
  | { shape: "round"; x: number; y: number; r: number }
  | {
      shape: "slot";
      x: number;
      y: number;
      w: number;
      h: number;
      turn?: number;
    };

const HOLES: Record<PlugType, Hole[]> = {
  A: [
    { shape: "slot", x: 38, y: 50, w: 7, h: 20 },
    { shape: "slot", x: 62, y: 50, w: 7, h: 20 },
  ],
  B: [
    { shape: "slot", x: 38, y: 46, w: 7, h: 20 },
    { shape: "slot", x: 62, y: 46, w: 7, h: 20 },
    { shape: "round", x: 50, y: 72, r: 4 },
  ],
  C: [
    { shape: "round", x: 38, y: 50, r: 5 },
    { shape: "round", x: 62, y: 50, r: 5 },
  ],
  D: [
    { shape: "round", x: 50, y: 32, r: 4.5 },
    { shape: "round", x: 38, y: 62, r: 4.5 },
    { shape: "round", x: 62, y: 62, r: 4.5 },
  ],
  E: [
    { shape: "round", x: 38, y: 50, r: 5 },
    { shape: "round", x: 62, y: 50, r: 5 },
    { shape: "round", x: 50, y: 70, r: 4 },
  ],
  F: [
    { shape: "round", x: 38, y: 50, r: 5 },
    { shape: "round", x: 62, y: 50, r: 5 },
    { shape: "slot", x: 12, y: 50, w: 6, h: 16 },
    { shape: "slot", x: 88, y: 50, w: 6, h: 16 },
  ],
  G: [
    { shape: "slot", x: 50, y: 34, w: 7, h: 15 },
    { shape: "slot", x: 38, y: 61, w: 16, h: 7 },
    { shape: "slot", x: 62, y: 61, w: 16, h: 7 },
  ],
  H: [
    { shape: "slot", x: 38, y: 40, w: 15, h: 6 },
    { shape: "slot", x: 62, y: 40, w: 15, h: 6 },
    { shape: "slot", x: 50, y: 62, w: 6, h: 15 },
  ],
  I: [
    { shape: "slot", x: 38, y: 44, w: 7, h: 18, turn: -30 },
    { shape: "slot", x: 62, y: 44, w: 7, h: 18, turn: 30 },
    { shape: "slot", x: 50, y: 66, w: 7, h: 16 },
  ],
  J: [
    { shape: "round", x: 50, y: 34, r: 4.5 },
    { shape: "round", x: 38, y: 62, r: 4.5 },
    { shape: "round", x: 62, y: 62, r: 4.5 },
  ],
  K: [
    { shape: "round", x: 38, y: 46, r: 5 },
    { shape: "round", x: 62, y: 46, r: 5 },
    { shape: "round", x: 50, y: 68, r: 4.5 },
  ],
  L: [
    { shape: "round", x: 28, y: 50, r: 5 },
    { shape: "round", x: 50, y: 50, r: 5 },
    { shape: "round", x: 72, y: 50, r: 5 },
  ],
  M: [
    { shape: "round", x: 50, y: 30, r: 6 },
    { shape: "round", x: 36, y: 64, r: 6 },
    { shape: "round", x: 64, y: 64, r: 6 },
  ],
  N: [
    { shape: "round", x: 50, y: 34, r: 4.5 },
    { shape: "round", x: 38, y: 62, r: 4.5 },
    { shape: "round", x: 62, y: 62, r: 4.5 },
  ],
};

export function PlugIcon({ type }: { type: PlugType }) {
  return (
    <svg
      className="plug"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Steckdose Typ ${type}`}
    >
      <rect x="6" y="6" width="88" height="88" rx="16" className="plug-face" />
      {HOLES[type].map((hole) => {
        const key =
          hole.shape === "round"
            ? `r-${hole.x}-${hole.y}`
            : `s-${hole.x}-${hole.y}-${hole.w}`;
        if (hole.shape === "round") {
          return (
            <circle
              key={key}
              cx={hole.x}
              cy={hole.y}
              r={hole.r}
              className="plug-hole"
            />
          );
        }
        const turn = hole.turn ?? 0;
        return (
          <rect
            key={key}
            x={hole.x - hole.w / 2}
            y={hole.y - hole.h / 2}
            width={hole.w}
            height={hole.h}
            rx={1.5}
            className="plug-hole"
            transform={
              turn === 0 ? undefined : `rotate(${turn} ${hole.x} ${hole.y})`
            }
          />
        );
      })}
    </svg>
  );
}
