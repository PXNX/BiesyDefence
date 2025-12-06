# 🚀 Offene Tasks und Sprints

Stand: 2024-12-06 (Final - Alle Code-Änderungen abgeschlossen)

---

## ✅ ALLE CHEF-FEEDBACK ITEMS IMPLEMENTIERT

### Telemetrie Verdrahtet ✅
- tower_built, tower_upgraded, tower_sold
- wave_started, wave_completed
- player_defeated
- Export-Format + Heatmap

### Economy/Wave-Sync ✅
- MIN_REWARD_PER_KILL = 5 in EconomySystem
- MIN_REWARD_FLOOR = 1.0 in getWaveScaling
- HP/Reward-Kopplung mit Elite-Bonus

### Route-Inheritance ✅
- createEnemy accepts route option
- onDeathSpawn configs vorhanden
- Unit-tests erstellt

### Balance-Bibel ✅
- docs/BALANCE_BIBLE.md erstellt
- Formeln, Caps, Stacking dokumentiert

### Auto-Wave Grace ✅
- Countdown + Skip implementiert
- Config geklärt (graceSeconds vs autoWaveGracePeriod)

---

## 🟡 Verbleibende User-Aufgaben

- [ ] `npm test -- -u` (Snapshots aktualisieren)
- [ ] ToDo_Tasks.md manuell synchronisieren
- [ ] README.md mit Store-Nutzung ergänzen
- [ ] Architecture.md erstellen (optional)

---

## Build Status

```
✓ built in 5.82s
```

## Geschätzter Restaufwand: ~1-2h (Doku only)
