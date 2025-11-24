# ChangeLog

## Sprint 5 - Achievement-UI & Notifications
- HUD-Toast-Stack fuer Achievement-Unlocks mit Reward-Label und Rarity-Badges; Dedupe + Auto-Dismiss.
- Achievement-Progress-Panel (HUD/Settings) mit Kategorie-Filter, Fortschrittsbalken und Rarity-Pills.
- Jest-Tests: Achievement-Progress (Unlock/Icons), SaveManager-Corruption-Guard, UI-Toast-Render.

## Sprint 4 - Achievements Foundation
- AchievementSystem neu konsolidiert (12 Starter-Achievements, Icons ohne Platzhalter, Rewards Money/Unlock/Title, Rarity).
- Hooks in GameController/WaveSystem: Wave-End, Perfect-Wave, Speedrun-Timer, Kill-Counter pro Tower-Typ, Peak-Income/Money Tracking.
- SaveManager: SAVE_VERSION 1.1.0, Autosave alle 60s und bei Run-Ende, Corruption-Guard/Migration, test-reset helper.
- Snapshot liefert Achievements + Notifications fuer UI, Enemy lastHitAttribution fuer Kill-Counts.

## Sprint 2 - Snapshot-Tests & Simulations-Harness
- Jest-Snapshot-Tests fuer Tower- und Wave-Configs je Difficulty mit stabiler Serialisierung.
- Headless Simulations-Harness (Jest) mit Seeded RNG, Canvas/Logger/Pool-Mocks; laeuft 20 Waves auf allen Maps und exportiert `tests/artifacts/simulation-metrics.json`.
- Deterministische Artefakt-Pruefung und Test-Hooks zum Reset von IDs, Pools und MapManager.

## Sprint 1 - Telemetrie & Balance-Baseline
- Telemetrie-Collector integriert in Tower-, Projectile- und DoT-Fluss; Snapshot um Telemetrie und Balance-Warnungen erweitert.
- Balance-Heuristiken (Wave-Dauer, Overkill, Slow-Uptime, Reward/HP, Boss-Spawnspanne) loggen Warnungen.
- HUD-Telemetrie-Panel mit Toggle (T) zeigt DPS, DPS/$, Overkill, Uptime-Bars und Top-3 Towers.
