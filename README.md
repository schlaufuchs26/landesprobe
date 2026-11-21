# Landesprobe

Rate das Land an seinem Alltag: Steckdose, Netzspannung, Straßenseite, Notruf,
Datumsformat, Farbfernsehen. Acht Runden, sechs Hinweise pro Runde, ein Tipp.

Live: https://schlaufuchs26.github.io/landesprobe/

## Spielen

Jede Runde zeigt sechs Hinweis-Karten, die erste liegt offen. Jede weitere Karte
kostet 120 Punkte, ein Fehltipp kostet 400, nach drei Fehltipps ist die Runde
vorbei. Ein richtiger Tipp zahlt 1000 Punkte minus der geöffneten Hinweise;
insgesamt sind 8000 Punkte zu holen.

Nach einem Fehltipp vergleicht das Spiel den Tipp mit den offenen Karten:
✓ stimmt, ≈ ähnlich (gleicher Steckertyp, gleiche Notrufnummer, gleiche
Spannung), ✗ anders.

## Zwei unabhängige Wege zur Antwort

1. **Das Bündel lesen, ohne Fachwissen.** Jeder Hinweis allein ist schwach, die
   Kombination ist eine Landkarte: Typ G plus Linksverkehr heißt britischer
   Einflusskreis, 230 V bei 60 Hz gibt es nur in Saudi-Arabien, SECAM zeigt
   Frankreich und seine früheren Kolonien, die Gruppierung 1,00,000 deutet auf
   Indien, Pakistan, Nepal oder Bangladesch. Wer kein Land kennt, kommt über
   Ausschließen weiter, und der Vergleich nach einem Fehltipp sagt genau,
   welcher Teil des Bündels noch nicht passt.
2. **Länderwissen.** Wer weiß, dass Japan an zwei Netzen hängt, dass Südafrika
   die 10111 wählt oder dass Österreich 122, 133 und 144 behalten hat, springt
   direkt zur Antwort.

Die erste Route funktioniert ohne Länderkenntnis, die zweite ohne Logik.

## Woher die Daten kommen

Die Werte stehen von Hand in `src/data/countries.ts`: Steckertypen nach
IEC 60083, Netzspannungen und Frequenzen, Links- und Rechtsverkehr,
Notrufnummern, Datums- und Zahlenformate, Papierformate, Temperatur- und
Geschwindigkeitseinheiten, PAL/SECAM/NTSC und der erste Wochentag. Jedes Land
hat eine kurze Begründung (`fact`), die in der Auflösung erscheint; sie erklärt
die Kuriosität, nicht nur die Zahl.

Zwei Invarianten prüft `tests/data.test.ts`:

- Die sechs Hinweise einer Runde lassen zusammen genau ein Land aus dem Pool
  von 47 übrig. Sonst könnte man richtig raten und trotzdem verlieren.
- Der erste, freie Hinweis allein reicht nicht: er muss auf mehrere Länder
  passen.

## Entwicklung

```bash
bun install
bun run dev      # lokaler Server
bun run checks   # format, tsc, biome, knip, Tests
bun run test:e2e # Playwright im echten Chromium
bun run build    # statisch nach dist/
```

Der Bau braucht nur Bun und React, keine weiteren Abhängigkeiten.
