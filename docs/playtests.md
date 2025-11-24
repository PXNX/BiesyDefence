# Playtest-Protokolle & QA-Flow

Ziel: Wiederverwendbare Vorlage fuer Playtests, ein dokumentierter Beispiel-Run sowie eine Balance-QA-Checkliste auf Basis der Telemetrie-Hooks.

## Vorlage (Copy/Paste)

```md
### Playtest <Datum> - <Ziel/Fokus>
- Map: <name/id>
- Difficulty: <easy|normal|hard>
- Seed: <fixed|random>
- Build: <commit/tag> ; Runner: <manuell|harness> ; Client: <Browser/OS/Hardware>
- Build-Order:
  1. Wave X: <Tower/Upgrade + Position/Notiz>
  2. Wave Y: <...>
- Ergebnis:
  - Waves: <erreicht>/<20> (Status: running/won/lost)
  - Lives uebrig: <n>
  - Score: <n>
  - Leaks: <n>
- Telemetrie-Auszug (Key-Waves oder Ausreisser):
  | Wave | DPS | DPS/$ | Overkill % | Warnungen/Notizen |
- Subjektive Notizen:
  - Flow/Spikes:
  - Lesbarkeit/UI:
  - Bugs/Glitches:
- Follow-ups:
  - <ToDo oder Ticket-Link>
```

## Beispiel-Run (Sprint-3 Baseline)

- Quelle: `tests/artifacts/simulation-metrics.json` (Headless-Harness `tests/simulations/harness.test.ts`)
- Build: `2eba444` (aktueller Stand), Seed `1337`, Runner: harness (keine manuellen Inputs)
- Map/Difficulty: Verdant Reach (`default`), `normal`
- Build-Order: Auto-Start mit Standard-Tuermen (Indica + Sativa per `createInitialState`), keine Upgrades, Waves sequentiell gestartet (Auto-Wave aus)
- Ergebnis: 20/20 Waves abgeschlossen, Lives 20/20, Leaks 0, Final Score 1492
- Telemetrie-Auszug (Auswahl):

| Wave | DPS | DPS/$ | Overkill % | Reward | Score | Notiz |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 296000 | 2041.379 | 18.24 | 26 | 96 | Mess-Offset durch extrem kurze Wave-Dauer |
| 5 | 9.143 | 0.063 | 5.72 | 88 | 426 | Stabil, keine Warnungen |
| 10 | 10.213 | 0.070 | 1.09 | 180 | 977 | Keine Leaks, DPS/$ im Soll |
| 15 | 13.770 | 0.095 | 0.82 | 289 | 1331 | Saubere Kurve, Overkill niedrig |
| 20 | 15.740 | 0.109 | ~0 | 417 | 1492 | Endwave ohne Warnungen |

- Aggregat (ueber 20 Waves, Seed 1337, Map default): ~DPS 14,810.28, ~DPS/$ 102.140, ~Overkill 4.64%, Peak-Overkill 18.24% (unter 35%-Schwelle)
- Auffaelligkeiten: Keine Telemetrie-Warnungen ausgeloest; Wave-1-DPS durch sehr kurze Dauer ueberproportional hoch, aber ab Wave 2 normalisiert.

## QA-Checkliste Balance-Regression

- Telemetrie-Warnungen pruefen (HUD oder Snapshot):
  - Overkill > 35%?
  - Slow-Uptime < 10% oder > 85%?
  - Wave-Dauer > 60s?
  - Reward/HP-Bandbreite ausserhalb 0.05-0.20?
  - Boss/Carrier-Spawn-Spanne > 15s?
- Telemetrie-Metriken pro Fokus-Wave gegen Vergleichsrun (Seed 1337, Map default) halten:
  - ~DPS/$ ~102, Overkill-Band <20%, keine Leaks
- Build-Order-Nachvollziehbarkeit: Schritte im Protokoll erfasst (Tower-Typ, Wave, Grund)
- UI/Flow: Telemetry-Panel per Toggle (T) sichtbar, Warnungen angezeigt, Daten plausibel aktualisiert
- Artefaktpflege: Neuer Run -> `tests/artifacts/simulation-metrics.json` bei Seed-Wechsel aktualisieren; Protokoll-Eintrag hier ergaenzen
