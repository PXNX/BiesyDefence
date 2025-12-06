# 🚀 Offene Tasks und Sprints

Stand: 2024-12-06 (Aktualisiert nach Chef-Feedback)

---

## Sprint A: Wave/Economy-Sync ✅ ABGESCHLOSSEN

- [x] Unit-Tests für getWaveScaling (HP/Reward-Kopplung)
- [x] Elite-Bonus korrekt angewendet
- [x] Min-Reward-Floor gegen Death Spiral
- [x] Integration in enemies.ts

**Dateien:** `enemies.test.ts`

---

## Sprint B: Route-Inheritance Tests ✅ ABGESCHLOSSEN

- [x] Unit-Tests für Multi-Path-Selektion
- [x] Unit-Tests für Splitter/On-Death-Spawn
- [x] Enemy-Tags getestet

**Dateien:** `routeInheritance.test.ts`

---

## Sprint C: Auto-Wave-Grace QA ✅ ABGESCHLOSSEN

- [x] E2E-Tests für Toggle, Countdown, Skip
- [x] Config geklärt: `graceSeconds` (2s) vs `autoWaveGracePeriod` (5s)

**Dateien:** `autoWaveGrace.test.ts`

---

## Sprint D: Balancing ✅ ABGESCHLOSSEN

- [x] Balance-Bibel erstellt (Formeln, Caps, Stacking)
- [x] Frühwellen-Rewards dokumentiert
- [x] Boss-Resistenzen dokumentiert

**Dateien:** `docs/BALANCE_BIBLE.md`

---

## Sprint E: Telemetrie/Eventing ✅ ABGESCHLOSSEN

- [x] tower_built, tower_upgraded, tower_sold Events
- [x] enemy_destroyed, player_defeated Events
- [x] wave_started, wave_completed Events
- [x] Export-Format (JSON) + Heatmap-Struktur

**Dateien:** `TelemetryEvents.ts`

---

## Sprint F: Dokumentation & Cleanup 🟡 OFFEN

- [ ] ToDo_Tasks.md Kapitel 2-3 Status aktualisieren
- [ ] README aktualisieren mit Store-Nutzung
- [ ] Architecture.md erstellen
- [ ] Test-Snapshots aktualisieren (`npm test -- -u`)

---

## Geschätzter Restaufwand

| Sprint | Status | Aufwand |
|--------|--------|---------|
| A: Wave/Economy-Sync | ✅ | - |
| B: Route-Inheritance | ✅ | - |
| C: Auto-Wave QA | ✅ | - |
| D: Balancing | ✅ | - |
| E: Telemetrie | ✅ | - |
| F: Dokumentation | 🟡 | 2-3h |
| **Gesamt verbleibend** | | **2-3h** |
