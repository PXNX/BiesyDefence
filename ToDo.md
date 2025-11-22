# ToDo – Beta-Prototyp in planbaren Sprints
Detailplan aus bisherigen Prompts, fein genug für fokussierte Work-Packages. Reihenfolge folgt Abhängigkeiten; mehrere Streams sind parallel möglich, aber Tests erst nach Kernänderungen anpassen.

## Sprint 1 – Telemetrie & Balance-Baseline
- Telemetrie-Collector
  - DamageEvents an zentraler Stelle sammeln (`TowerSystem`, `ProjectileSystem`, DoT in `EnemySystem`), inkl. Quelle (towerId/type), Ziel (enemyType), DamageType, Overkill-Anteil.
  - Ringbuffer + Aggregator pro Tick/Wave: DPS, DPS/$, Overkill%, Hits/Shot, Slow-Uptime, DoT-Uptime.
  - Snapshot-Erweiterung: Telemetrie-Block an `GameSnapshot` anhängen (Top-3 DPS/$, Overkill-Warnflag).
- Balance-Heuristiken
  - Checks implementieren: Wave-Dauer > Xs, Overkill > 35%, Slow-Uptime < 10% oder > Cap, Reward/HP-Bandbreite, Boss/Carrier Spawn-Länge.
  - Heuristik-Warnungen in Snapshot und Console (debug channel).
- HUD-Mini-Dashboard (Toggle)
  - Neues UI-Panel (HUD/Sidebar) mit Top-3 Towers nach DPS/$, Overkill-Warnung, Slow-Uptime-Indikator; Toggle über Settings/Hotkey.
  - Einfaches Layout ohne Assets (reiner Text/Bars), um schnell nutzbar zu sein.

## Sprint 2 – Snapshot-Tests & Simulations-Harness
- Snapshots
  - Jest-Snapshot-Tests für `config/constants.ts` (Towerprofile) und `config/waves.ts` (Wave-Komposition, Rewards, Delays) pro Difficulty.
  - Fixtures pflegen; Helper für deterministische Serialisierung (Sortierung, feste Zahlenformate).
- Simulations-Harness
  - Headless Runner (Jest/Node) mit deterministischem Seed; nutzt `GameController` mit Stub-Renderer.
  - Läuft 20 Waves auf allen Maps (`MapManager`) und loggt Wave-Dauer, Leaks, Reward, DPS/$ pro Tower.
  - Test asserts: kein Crash, deterministische Ergebnisse bei gleichem Seed; Export der Metriken als JSON (test-artifact).

## Sprint 3 – Playtest-Protokolle & QA-Flow
- Markdown-Vorlage `docs/playtests.md`: Felder für Map, Seed, Build-Order, Ergebnis, subjektive Notizen, Telemetrie-Auszug.
- Beispiel-Run dokumentieren (1 Eintrag) mit aktuellen Zahlen.
- QA-Checkliste für Balance-Regression (welche Warnungen prüfen, welche Thresholds akzeptiert).

## Sprint 4 – Achievements Foundation
- Event-Hooks
  - In `GameController`/`WaveSystem` Hooks für Wave-End, Leak, Perfect-Wave, Speedrun-Timer.
  - In `TowerSystem` Kill-Counter pro Tower-Typ; in `EconomySystem` Peak-Money/Income.
- Definitions
  - 10–15 Starter-Achievements mit Icons, Targets, Rarity, Rewards (Money, Titel, Map-Unlocks).
  - Konsolidierte Struktur in `AchievementSystem.ts` (keine `??`-Icons mehr).
- Autosave
  - `SaveManager` Autosave bei Run-Ende + alle 60s; Corruption-Guard; `SAVE_VERSION` Migrationstest.

## Sprint 5 – Achievement-UI & Notifications
- Toast/Notification im HUD mit Name + Reward, throttle/dedupe.
- Progress-Panel im Pause/Settings Screen: Filter nach Kategorie, Fortschrittsbalken, Rarity-Badge.
- Tests: Achievement-Progress-Unit-Tests, LocalStorage-Mocks, UI-Snapshot.

## Sprint 6 – Seeded Challenges & RNG
- RNG-Provider
  - Zentraler Seeded RNG für Waves/Spawns/Random-placements; URL-Param `?seed=` akzeptieren; Default: Daily-Seed (Datum).
  - Audit: alle `Math.random`-Nutzungen bündeln (Spawner, MapManager randomPath, Partikel optional?).
- Challenge-Modus
  - Auswahl-Screen: Daily/Custom Seed, Anzeige aktiver Modifier, erwartete Difficulty-Note, Start-Lock-In.
  - Test: gleicher Seed → identische SpawnQueue/WaveStats (Jest).

## Sprint 7 – Modifier-Rahmen & Lokales Leaderboard
- Modifier-Datenmodell (Speed+, Range-, BossRush, NoSlow, Allowed Towers) mit Stack/Caps-Regeln.
- Hooks in Wave-/Tower-Systemen (Speed-Multiplikator, Range-Cap, Slow-Verbot).
- Local Leaderboard (LocalStorage) pro Seed: Best Wave/Score/Time, vorbereitet für Backend.
- Tests: Modifier-Contract, Daily-Generation-Smoke.

## Sprint 8 – Assets & FX Integration (ohne großen Perf-Risiko)
- Assets aus `Assets_Grafics.md` einbinden: Tower-Level-PNGs, Enemy-Badges (fast/armored/boss/swarm), Projectile-FX.
- Renderer: Badge-Overlay + Level-Sprite pro Tower; Fallback wenn Asset fehlt.
- Combat-FX: Chain-Lightning Arcs + Partikel-Burst, Burn-Overlay, Slow-Ring-Pulse; Toggles respektieren.
- Pfade in `public/` dokumentieren (`public/towers`, `public/enemies`, `public/effects`, `public/ui/icons`).

## Sprint 9 – UI-Microflows & Settings
- TowerIconBar ↔ TowerDetailsPanel Sync: DPS-Progression, Kosten, Counter-Tags/Resists in Tooltip.
- Smooth-Transitions (fade/slide) für Panels; Settings-Popover mit Hitmarker/Numbers Toggle.
- HUD-Icons (coin/wave/heart), Path/Grass Variationen laden.
- Mini-Tutorial-Overlay (3 Steps) beim ersten Start, Persistenz via `SaveManager`.

## Sprint 10 – Performance/LOD & Profiling
- LOD-Hooks: Tower-Detail bei Zoom, Offscreen particle budget limiter.
- Advanced culling optional guard-railed.
- Profiling-Script (Vite build + puppeteer trace); kurzer Report/Notiz im Repo.

## Sprint 11 – Abschluss & Changelog-Pflege
- ChangeLog auf Alpha v0.1 Basis: Einträge pro Sprint/Funktion.
- Finaler QA-Pass: `npm test`, Sim-Harness, manuelle Telemetrie-HUD-Check.
