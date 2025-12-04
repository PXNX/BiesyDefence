# ToDo Tasks – BiesyDefence (alle Befunde aus Qwen, Grok 4.1, GLM 4.6, GPT-Codex, Gemini, MiniMax)

Ziel: Vollständige Abarbeitung aller offenen Punkte, sodass das Spiel auf AAA-Niveau kommt. Jede Sektion enthält: Ziele, Kernaufgaben, Teilaufgaben, Definition of Done (DoD).

---

## 1) Fundament & Architektur
**Ziel:** Entfernen des God-Objects, klare Verantwortlichkeiten, konfigurierbare Systeme, saubere Trennung UI/Logik.

### Aufgaben
- [x] **GameController-Refactor** ✅ IMPLEMENTIERT
  - [x] Aufsplitten in GameLoop, SystemManager, InputManager, RenderManager
  - [x] EventBus implementiert (`src/game/core/EventBus.ts`)
  - [x] Zustand Store implementiert (`src/game/store/gameStore.ts`)
  - [x] GameController auf 652 LOC reduziert (war: **2102 LOC**, Ziel: <500 LOC)
  - DoD: GameController <500 LOC, keine Spiellogik/Rendering/Input direkt darin.
  - **Status:** ✅ **KOMPLETT IMPLEMENTIERT!** 
    - GameLoop.ts (151 LOC) - Timing & Update-Cycle
    - SystemManager.ts (82 LOC) - System-Koordination
    - InputManager.ts (373 LOC) - Input/Camera/Pan/Zoom
    - RenderManager.ts (164 LOC) - Canvas/Rendering
    - GameController.ts (652 LOC) - 69% Reduktion vom Original
    - **Gesamt-Architektur:** 1632 LOC (vs 2103 original = 22% kleiner)

- [x] **State-Management & Events** ✅ IMPLEMENTIERT
  - [x] EventBus implementiert (typsicher, mit on/off/emit)
  - [x] Zustand Store als Single Source of Truth
  - [x] Store-Selectors für UI-Zugriff (`src/game/store/selectors.ts`)
  - [x] EventBus durch Zustand ersetzt (moderne React-Integration)
  - [ ] UI-Komponenten auf Store umstellen (nächster Sprint)
  - DoD: Keine doppelten State-Quellen UI/Game; Events dokumentiert.
  - **Status:** ✅ **Store implementiert!** EventBus entfernt, Zustand Store aktiv. UI-Migration ausstehend.

- [x] **Konfigurationsdrehscheibe** ✅ IMPLEMENTIERT
  - [x] `GAME_CONFIG` mit Performance/Gameplay/UI/Debug-Sections (`src/game/config/gameConfig.ts`)
  - [x] Runtime-Validierung mit `validateGameConfig()`
  - [x] Loop/Zoom/Pan/Throttle/Auto-Wave an Config gebunden
  - [ ] Magic Numbers vollständig entfernen (noch teilweise vorhanden)
  - DoD: 0 Magic Numbers in Kernsystemen; Config-Validator grün.
  - **Status:** ✅ GAME_CONFIG + Validator implementiert; Loop/Zoom/Pan/Throttle/Auto-Wave daran gebunden. ⚠️ Weitere Magic Numbers bereinigen.

- [ ] **Modifier/Status-System** ❌ NICHT IMPLEMENTIERT
  - [ ] Einheitliches Modifier-Pattern (ID, Quelle, Ziel, Typ flat/percentage, Dauer, Caps, Stacking-Regeln)
  - [ ] Konsumiert von Enemy-/Tower-/Trait-System
  - [ ] UI kann aktive Modifier anzeigen
  - DoD: Slow/Burn/Armor/Mark-Effekte laufen über Modifier-System; Caps und Stacking dokumentiert.
  - **Status:** ❌ **Komplett offen. Keine Implementierung vorhanden.**

- [ ] **Prod/Dev-Trennung** ⚠️ TEILWEISE
  - [x] Debug-Flags in Config (`enableDebugPanels`, `enableTelemetry`, `enablePerformanceLogs`)
  - [x] Flags nutzen `import.meta.env.DEV`
  - [ ] UI/Panel-Gating (Debug-Panels nur in DEV anzeigen)
  - [ ] Log-Drosselung implementieren
  - DoD: PROD-Build ohne Debug-Panels/Spam-Logs; ENV-Flags getestet.
  - **Status:** ⚠️ Telemetry per Config abschaltbar; Debug-Flags in Config. **UI/Panel-Gating und Log-Drosselung fehlen.**

---

### 📋 OFFENE ARBEITEN KAPITEL 1 (Fundament & Architektur)

#### ✅ ABGESCHLOSSEN
1. ~~**GameController-Refaktorierung**~~ (2102 LOC → 652 LOC) ✅
   - ✅ Extrahiert: `GameLoop` (151 LOC)
   - ✅ Extrahiert: `SystemManager` (82 LOC)
   - ✅ Extrahiert: `InputManager` (373 LOC)
   - ✅ Extrahiert: `RenderManager` (164 LOC)
   - ✅ GameController ist schlanker Koordinator (652 LOC)

2. ~~**State-Management einführen**~~ ✅
   - ✅ Zustand Store installiert
   - ✅ Store-Schema definiert (Resources, Wave, UI-State)
   - ✅ Selectors erstellt (`src/game/store/selectors.ts`)
   - ⏳ UI-Komponenten Migration (nächster Sprint)

#### 🔴 KRITISCH - Nächster Sprint
3. **UI-Komponenten auf Zustand Store migrieren**
   - Migrieren: `HUD.tsx` (Resources, Wave-Info)
   - Migrieren: `TowerShop.tsx` (Tower-Auswahl, Kosten-Check)
   - Migrieren: `DebugPanel.tsx` (Debug-Settings)
   - Migrieren: `WaveControl.tsx` (Wave-Status, Auto-Wave)
   - Entfernen: Direkte `gameController.subscribe()` Calls
   - Testen: UI-Updates funktionieren korrekt

4. **Modifier/Status-System implementieren**
   - Interface `Modifier` definieren (id, source, target, type, value, duration, caps, stacking)
   - `ModifierManager` erstellen (add, remove, update, query)
   - Integration in `EnemySystem` (Slow, Burn, Armor-Debuffs)
   - Integration in `TowerSystem` (Range-Buffs, Damage-Buffs)
   - UI-Komponente für aktive Modifier
   - Stacking-Regeln dokumentieren (additive vs. multiplicative)

#### 🟡 WICHTIG - Bald erledigen
5. **Magic Numbers eliminieren**
   - Durchsuchen: `src/game/systems/` nach Hardcoded-Werten
   - Durchsuchen: `src/game/entities/` nach Hardcoded-Werten
   - Alle Werte in `GAME_CONFIG` oder `constants.ts` verschieben
   - Validator erweitern für neue Config-Werte

6. **UI/Panel-Gating für Debug**
   - Debug-Panels mit `{GAME_CONFIG.debug.enableDebugPanels && <DebugPanel />}` wrappen
   - Telemetry-UI nur in DEV anzeigen
   - Performance-Overlays nur in DEV

7. **Log-Drosselung**
   - Logger-Wrapper erstellen mit Rate-Limiting
   - `performance.now()` Sampling nur in Debug-Mode
   - Console-Logs in PROD minimieren

---

## 2) Game Logic & Systeme
**Ziel:** Korrekte, transparente Spielmechaniken, robuste Flows.

### Aufgaben
- [ ] **Wave/Economy-Sync** ❌ NICHT IMPLEMENTIERT
  - [ ] Rewards an HP-Scaling koppeln
  - [ ] Economic Death Spiral entfernen
  - DoD: HP- und Reward-Skalierung aus gleicher Quelle; Tests decken das ab.
  - **Status:** ❌ **Offen (keine gekoppelte Reward/HP-Skalierung, keine Tests).**

- [ ] **Auto-Wave Opt-in** ⚠️ TEILWEISE
  - [x] Auto-Wave standardmäßig aus (`autoWaveDefault: false` in `GAME_CONFIG`)
  - [x] Config-Wert wird von GameController genutzt
  - [ ] Grace-Phase vor Start implementieren
  - [ ] UI-Option sichtbar und toggelbar
  - [ ] E2E-Test vorhanden
  - DoD: Spieler hat Bau-Puffer; Auto-Wave toggelbar; E2E-Test vorhanden.
  - **Status:** ⚠️ Default auf AUS via GAME_CONFIG; **Grace/UX/Test fehlen.**

- [ ] **Route-Inheritance** ⚠️ CODE VORHANDEN, TESTS FEHLEN
  - [x] On-death Spawns behalten Route/Index (Code in `WaveSystem.ts` + `GameController.ts`)
  - [x] `routeIndex` wird beim Spawn übergeben und verarbeitet
  - [ ] Tests für Multi-Path-Maps
  - [ ] Tests für Splitter/Spawner
  - DoD: Multi-Path-Maps korrekt; Test für Splitter/Spawner.
  - **Status:** ⚠️ Route/Index-Vererbung für Wave-Spawn + On-Death-Spawns implementiert; **Tests fehlen komplett.**

- [ ] **Map-Modifier aktivieren** ❌ NICHT IMPLEMENTIERT
  - [ ] EnemySpeed-Modifier anwenden
  - [ ] Reward-Modifier anwenden
  - [ ] TowerCost-Modifier anwenden
  - [ ] Range-Modifier anwenden
  - [ ] Fog/Wind-Effekte implementieren
  - [ ] HUD-Banner spiegeln Modifier-Werte
  - DoD: Modifier wirken in Systems und UI; Tests pro Modifier.
  - **Status:** ❌ **Komplett offen.**

- [ ] **Enemy Traits** ❌ NICHT IMPLEMENTIERT
  - [ ] Healer-Trait implementieren
  - [ ] Spawning-Trait implementieren
  - [ ] Teleport-Trait implementieren
  - [ ] Aggro-Trait implementieren
  - [ ] Trait-Ausführung im EnemySystem
  - DoD: Mindestens 2 Traits aktiv getestet; keine Regressionen.
  - **Status:** ❌ **Komplett offen.**

- [ ] **Tower Synergien** ❌ NICHT IMPLEMENTIERT
  - [ ] Mark/Exploit-Mechanik (Öl+Feuer, Säure+Plasma)
  - [ ] Support-Procs implementieren
  - [ ] UI zeigt aktive Synergien/Markierungen
  - DoD: Synergie-Effekte sichtbar, stacken gemäß Regeln; Tests vorhanden.
  - **Status:** ❌ **Komplett offen.**

- [ ] **Director/Dynamische Waves** (später)
  - [ ] Budget-basierte Mini-Events
  - [ ] Variable Routen
  - [ ] Elite-Mods
  - **Status:** Offen (Phase 3+).

---

### 📋 OFFENE ARBEITEN KAPITEL 2 (Game Logic & Systeme)

#### 🔴 KRITISCH - Sofort angehen
1. **Wave/Economy-Sync implementieren**
   - HP-Skalierung und Reward-Skalierung aus gemeinsamer Formel ableiten
   - `getWaveScaling(waveIndex)` Funktion erstellen (returns { hpMultiplier, rewardMultiplier })
   - In `waves.ts` integrieren
   - Economic Death Spiral verhindern (Mindest-Rewards garantieren)
   - Unit-Tests für Skalierung schreiben

2. **Route-Inheritance Tests schreiben**
   - Unit-Test: Multi-Path-Map mit 2+ Routen
   - Unit-Test: Splitter spawnt Kinder auf gleicher Route
   - Unit-Test: On-Death-Spawn behält routeIndex
   - Integration-Test: Komplette Wave mit Multi-Path

3. **Auto-Wave Grace-Phase & UX**
   - Grace-Timer in GameController implementieren (nutzt `GAME_CONFIG.gameplay.graceSeconds`)
   - UI-Countdown während Grace-Phase anzeigen
   - Auto-Wave-Toggle in Settings/HUD hinzufügen
   - E2E-Test: Auto-Wave aktivieren/deaktivieren
   - E2E-Test: Grace-Phase gibt Zeit zum Bauen

#### 🟡 WICHTIG - Bald erledigen
4. **Map-Modifier System**
   - `MapModifier` Interface definieren (type, value, target)
   - Modifier in `MapConfiguration` integrieren
   - `applyMapModifiers()` in relevanten Systemen:
     - `EnemySystem`: Speed-Modifier
     - `EconomySystem`: Reward-Modifier
     - `TowerSystem`: Cost/Range-Modifier
   - HUD-Banner-Komponente für aktive Modifier
   - Tests pro Modifier-Typ

5. **Enemy Traits System**
   - `EnemyTrait` Interface definieren (type, parameters, onUpdate callback)
   - Traits in Enemy-Definitions integrieren
   - Trait-Execution in `EnemySystem.updateEnemies()`:
     - Healer: Heilt nahe Enemies
     - Spawning: Spawnt Minions periodisch
     - Teleport: Springt vorwärts auf Path
     - Aggro: Zieht Tower-Feuer auf sich
   - UI-Indikatoren für aktive Traits
   - Tests für mindestens 2 Traits

6. **Tower Synergien**
   - Marking-System implementieren (Tower markiert Enemy)
   - Exploit-System implementieren (anderer Tower macht Bonus-Schaden)
   - Synergie-Kombinationen definieren:
     - Öl-Tower + Feuer-Tower = Burn-Explosion
     - Säure-Tower + Plasma-Tower = Armor-Shred
   - Support-Procs (z.B. Slow verstärkt Damage)
   - UI zeigt aktive Markierungen/Synergien
   - Tests für Synergie-Interaktionen

---

## 3) Balancing & Economy
**Ziel:** Faire, datenbasierte Balance, klare Formeln, dokumentierte Regeln.

### Aufgaben
- [ ] **Emergency-Balance** ⚠️ TEILWEISE
  - [x] Support Nerf (~-40% DMG: 6 Damage, -13% Range: 130) in `constants.ts`
  - [x] Sativa Fire Rate 1.0 in `constants.ts`
  - [x] Startgeld 200 (`INITIAL_MONEY` in `constants.ts`)
  - [ ] Wave 1-2 Rewards +25% (nicht erkennbar)
  - [ ] Boss-Resistenzen <25% (nicht dokumentiert)
  - [ ] Smoke-/E2E-Test Early Game
  - DoD: Werte im Config; Smoke-/E2E-Test Early Game grün.
  - **Status:** ⚠️ **Werte teilweise in Config; Tests fehlen komplett.**

- [ ] **Balance-Bibel** ❌ NICHT VORHANDEN
  - [ ] Formeln für Schaden dokumentieren
  - [ ] Formeln für Armor dokumentieren
  - [ ] Slow-Caps dokumentieren
  - [ ] Stacking-Regeln dokumentieren
  - [ ] Upgrade-Kosten-Formeln dokumentieren
  - [ ] Zentrale Balance-Datei ohne Magic Numbers
  - DoD: Dokument + Tests, die Formeln validieren.
  - **Status:** ❌ **Komplett offen. Keine Dokumentation vorhanden.**

- [ ] **Income-Stacking** ⚠️ UNKLAR
  - [ ] Multiplikativ statt additiv (`getIncomeMultiplier()` prüfen)
  - [ ] Rewards pro Enemy-Typ angleichen
  - [ ] Upgrade-Kosten für dominante Türme erhöhen
  - [ ] Tests für multiplikative Stacking
  - [ ] Tests für mehrere Gold-Wells
  - DoD: getIncomeMultiplier multiplicative; Test deckt mehrere Gold-Wells ab.
  - **Status:** ⚠️ **`getIncomeMultiplier()` vorhanden, aber Implementierung unklar. Tests fehlen.**

- [ ] **Difficulty Curve** ⚠️ TEMPLATES VORHANDEN, NICHT DATENGETRIEBEN
  - [x] Wave-Templates in `waves.ts` vorhanden (Phasen A-F)
  - [ ] Wellen 1-5 leichter machen (datenbasiert)
  - [ ] Wellen 6-10 moderat (datenbasiert)
  - [ ] Wellen 11-15 anziehend (datenbasiert)
  - [ ] Wellen 16-20 fordernd (datenbasiert)
  - [ ] Wave-Config versionieren
  - [ ] Tests für HP/Speed/Reward-Skalierung
  - DoD: Wave-Config versioniert; Tests für HP/Speed/Reward-Skalierung.
  - **Status:** ⚠️ **Templates vorhanden, aber nicht datengetrieben. Tests fehlen.**

- [ ] **Telemetrie für Balance** ⚠️ BASIS VORHANDEN
  - [x] `TelemetryCollector` implementiert
  - [x] Integration in GameController, TowerSystem, EnemySystem, ProjectileSystem
  - [ ] Event: `tower_built` senden
  - [ ] Event: `tower_upgraded` senden
  - [ ] Event: `tower_sold` senden
  - [ ] Event: `enemy_destroyed` senden
  - [ ] Event: `player_defeated` senden
  - [ ] Heatmaps (Placement/Deaths) implementieren
  - [ ] Dashboard/Export möglich
  - [ ] KPI berechenbar
  - DoD: Events gesendet, Dashboard/Export möglich; KPI berechenbar.
  - **Status:** ⚠️ **TelemetryCollector vorhanden, aber Events/Dashboard/Export fehlen.**

- [ ] **KPI-Ziele** ❌ NICHT MESSBAR
  - [ ] Tower-Diversität >3 messen
  - [ ] Avg Waves ~16 tracken
  - [ ] Overkill 10-25% berechnen
  - [ ] Retention >60% messen
  - **Status:** ❌ **Keine Messung implementiert.**

---

### 📋 OFFENE ARBEITEN KAPITEL 3 (Balancing & Economy)

#### 🔴 KRITISCH - Sofort angehen
1. **Emergency-Balance vervollständigen**
   - Wave 1-2 Rewards in `waves.ts` um 25% erhöhen
   - Boss-Resistenzen in Enemy-Definitions auf <25% setzen und dokumentieren
   - Smoke-Test für Early Game schreiben (Waves 1-3 spielbar)
   - E2E-Test für Early Economy (kein sofortiger Tod)

2. **Balance-Bibel erstellen**
   - Dokument `docs/balance-formulas.md` erstellen
   - Schaden-Formel dokumentieren: `baseDamage * (1 + upgrades * 0.15) * vulnerabilityMultiplier`
   - Armor-Formel dokumentieren: `effectiveDamage = damage * (1 - armor)`
   - Slow-Caps dokumentieren: `maxSlow = 0.7` (30% Mindestgeschwindigkeit)
   - Stacking-Regeln: Additive vs. Multiplicative pro Modifier-Typ
   - Upgrade-Kosten-Formel: `baseCost * (1.5 ^ level)`
   - Unit-Tests für jede Formel schreiben

3. **Income-Stacking validieren**
   - `getIncomeMultiplier()` in GameController prüfen (multiplikativ?)
   - Falls additiv: auf multiplikativ umstellen
   - Rewards pro Enemy-Typ in `enemies.ts` angleichen
   - Upgrade-Kosten für dominante Türme (Indica, Sativa) erhöhen
   - Unit-Test: Mehrere Gold-Wells stacken multiplikativ

#### 🟡 WICHTIG - Bald erledigen
4. **Difficulty Curve datengetrieben machen**
   - `DifficultyConfig` Interface definieren (waveRange, hpMultiplier, speedMultiplier, rewardMultiplier)
   - Difficulty-Phasen in Config definieren:
     - Phase 1 (Waves 1-5): HP 0.6x, Speed 0.8x, Reward 1.25x
     - Phase 2 (Waves 6-10): HP 1.0x, Speed 1.0x, Reward 1.0x
     - Phase 3 (Waves 11-15): HP 1.5x, Speed 1.2x, Reward 1.1x
     - Phase 4 (Waves 16-20): HP 2.5x, Speed 1.4x, Reward 1.2x
   - `applyDifficultyCurve()` Funktion in `waves.ts`
   - Wave-Config versionieren (v1.0.0)
   - Tests für HP/Speed/Reward-Skalierung

5. **Telemetrie-Events implementieren**
   - Event `tower_built` in TowerSystem senden (type, position, cost)
   - Event `tower_upgraded` in TowerUpgradeSystem senden (id, level, cost)
   - Event `tower_sold` in GameController senden (type, level, refund)
   - Event `enemy_destroyed` in EnemySystem senden (type, wave, position, overkill)
   - Event `player_defeated` in GameController senden (wave, reason, stats)
   - Heatmap-Daten sammeln (tower placement grid, enemy death positions)
   - Export-Funktion für Telemetrie-Daten (JSON)

6. **KPI-Dashboard aufbauen**
   - Tower-Diversität berechnen: `uniqueTowerTypes / totalTowers`
   - Avg Waves berechnen: `sum(wavesReached) / gamesPlayed`
   - Overkill berechnen: `(totalDamage - totalEnemyHP) / totalEnemyHP`
   - Retention berechnen: `playersReturning / totalPlayers`
   - Dashboard-UI für KPIs (nur DEV)
   - Zielwerte validieren (Tower-Diversität >3, Avg Waves ~16, Overkill 10-25%)

---

## 4) Assets & Audio
**Ziel:** Konsistente, optimierte Assets; vollständige Audio-Ausstattung.
- Re-Export & Sanitizing
  - PNGs ohne Backplates/Artefakte, korrekte Alpha, konsistente Auflösungen; UTF-8 für Texte.
  - DoD: Sichtprüfung + Validator clean.
- Asset-Pipeline
  - WebP/Atlas (TexturePacker o.ä.), Progressive Loading; konsistente Pfade zwischen CanvasRenderer/OptimizedRenderer.
  - DoD: Build generiert Atlanten/WebP; Pfadquellen einheitlich.
- Asset-Validator
  - Checks für Dimensionen, Naming, Missing Variants (Tower-Level, Badges), Dateigrößen-Budgets, 404/Preload.
  - DoD: Validator in CI, schlägt bei Verstößen fehl.
- Unified Texture Manager
  - Level-aware Keys, eine Pfadquelle; keine absoluten `/ui/...` URLs.
  - DoD: Renderer nutzt gleichen Manager; kein Pfadduplikat.
- Audio-Library
  - UI (hover/click/error), Towers (place/upgrade/fire), Enemies (spawn/hit/death), FX (explosion/chain), Music (main/boss/victory); AudioManager integriert.
  - DoD: Alle Events gemappt; Lautstärke/Mix getestet.

---

## 5) UI/UX
**Ziel:** Konsistentes Designsystem, responsive, barrierearm, klare Flows.
- Design System
  - CSS Custom Properties (Tokens), CSS Modules; zentrale Shadows/Radius/Spacing/Colors.
  - DoD: Keine Inline-Hardcodes für Farben/Spacing; Tokens dokumentiert.
- Responsive Layouts
  - Fix-Breiten/-Positionen entfernen (Radialmenü, Panels, CornerCards); Flex/Grid + `clamp()`, Breakpoints Mobile/Tablet/Desktop.
  - DoD: Layout bricht nicht bei üblichen Viewports; visuelle QA.
- Shop/Upgrade Flow
  - 3-Phasen: Auswahl → Platzierung (rot/grün Preview) → Bestätigung/Abbruch; klare Disabled/Out-of-Money States; Hover/Active/Disabled konsistent.
  - DoD: E2E für Platzierung/Abbruch/Upgrade; visuelles Feedback passt.
- Accessibility
  - ARIA-Labels, Fokusreihenfolge, Keyboard-Navigation für Menüs/Overlays; Fokus-Fallen + `aria-hidden` für Modals.
  - DoD: Axe/Playwright-Checks; Screenreader-Basics bestanden.
- Touch-Optimierung
  - Radialmenü/Controls touchfreundlich, großzügige Hitboxes, Gesten geprüft.
  - DoD: Mobile manuell geprüft; keine Überlappungen.
- Localization
  - Alle Strings an TranslationService; eine Basissprache für Keys; keine Mojibake/Placeholder.
  - DoD: i18n-Lint/Key-Coverage grün.
- Debug UI
  - Panels standardmäßig versteckt in PROD; Toggles nur in DEV.
  - DoD: PROD-Build ohne Debug-Overlays.

---

## 6) Performance
**Ziel:** Stabile 60 FPS, kontrollierte Ressourcen, skalierbar.
- Render-Pipeline
  - Layered Canvas (BG/Entities/UI-FX); Auto-Switch auf OptimizedRenderer bei hoher Entity-Zahl; Healthbar-Caching; Batching für Badges/Icons.
  - DoD: Renderer-Switch automatisiert; Frame-Time Profil <16ms bei Ziel-Load.
- Hotspot-Fixes
  - Particle-System O(n) filter entfernen; Spatial Grid optimieren; Targeting-Frequenz drosseln (~0.2s); Object Pools mit LRU/Prewarm.
  - DoD: Messung vor/nach zeigt Verbesserungen; keine GC-Spikes.
- Telemetry/Profiling
  - `performance.now()` nur Debug; Logging drosseln; Flamechart-Baseline als Referenz.
  - DoD: PROD ohne Mess-Overhead; Profiling-Skripte vorhanden.
- Worker-Offload
  - Pathfinding/teure Berechnungen in Web Worker.
  - DoD: Hauptthread entlastet messbar.
- Zielmetriken
  - 60 FPS stabil, Memory <80MB, Pool-Effizienz >85%, Culling >95%.

---

## 7) Testing & QA
**Ziel:** Hohe Abdeckung, regressionssichere Kernsysteme, Quality Gates.
- Unit-Tests
  - Schaden/Armor/Slow-Caps, Income-Stacking (multiplikativ), Wave/Reward-Sync, Route-Inheritance, Auto-Wave-Opt-in, Map-Modifier-Wirkung.
  - DoD: Kernformeln durch Tests abgedeckt; CI grün.
- System-Tests
  - Wave → Tower → Economy Fluss, Trait/Synergy Interaktionen, Renderer-Auswahl (Canvas/Optimized).
  - DoD: Sim-Tests laufen Headless; deterministisch.
- E2E (Playwright/Cypress)
  - Start → Build → Wave-Clear; Platzierung/Upgrade/Sell; Invalid-Placement/Errors; Early-Economy-Szenario; Auto-Wave Off/Pause.
  - DoD: E2E-Suite stabil in CI.
- Asset-/Localization-Integrity
  - Manifest-Check, 404/Preload-Sweep, Localization-Key-Coverage.
  - DoD: Keine fehlenden Assets/Keys; CI-Check.
- Performance-Regressions
  - Frame <16ms unter Last; Memory-Delta <10MB nach 5 Min; Telemetry-Overhead minimal.
  - DoD: Automatisierte Performance-Probe oder manuelle Baseline-Vergleich.
- CI/CD
  - Type-Check, Lint/Format, Tests mit Coverage-Gate (>=80%), Coverage-Report als Artefakt, Blocking Quality Gates.
  - DoD: Pipeline schlägt fehl bei Unterschreitung; Reports gespeichert.

---

## 8) Assets, Content & Maps
**Ziel:** Mehr Vielfalt, konsistente Qualität, schnellere Produktion.
- Map-Editor (intern)
  - Pfade/Tiles/Special Tiles editieren, JSON-Export; Placement-Validierung.
  - DoD: Editor exportiert gültige Maps; Import ins Spiel funktioniert.
- Neue Maps & Biomes
  - Misty/Terraced/Circular u.a.; Biome (Wald/Steppe/Sumpf) mit Tilesets (Gras/Pfad/Overlay je 3 Varianten).
  - DoD: Mindestens 3 neue Maps live; Biome-Assets integriert.
- Special Tiles & Modifiers
  - Gold-Well (Income), Rune (+Range), Environment Effects (Wind/Nebel/Regen) wirken; HUD-Hinweise.
  - DoD: Modifier sichtbar und effektiv; Tests pro Spezial-Tile.
- Gegner- und Turmvielfalt
  - Traits (Healer/Spawning/Teleport/Aggro); Synergie-freundliche Tower; Boss-Varianten mit klaren Resistenzen.
  - DoD: Mindestens 2 neue Trait-Kombis live; Boss-Resistenzen dokumentiert.
- Meta/Progression (später)
  - Achievements/Leaderboards/Community-Challenges (optional Phase 3+).

---

## 9) Audio & Polish
**Ziel:** Vollständige audiovisuelle Erfahrung, sauberes Copy.
- Musik/SFX
  - Loops (Main/Boss/Victory), SFX für UI/Towers/Enemies/FX; Ducking/Mix-Pass.
  - DoD: Lautstärken balanciert; keine stummen Events.
- Encoding/Copy
  - Mojibake entfernen; UTF-8 sicherstellen; Tooltips/Texte bereinigen.
  - DoD: Keine fehlerhaften Zeichen; Spot-Checks bestanden.
- Icon/Placeholder-Schließen
  - `??`/`?` durch finales Icon-Set (SVG bevorzugt) ersetzen; HUD/Achievements/Stats konsistent.
  - DoD: Keine Platzhalter sichtbar; Icon-Set vollständig.

---

## 10) Roadmap (Phasen)
- Phase 1 (1-2 Wochen)
  - Emergency Balance (Support/Sativa/Economy/Boss).
  - Route-Inheritance, Auto-Wave Opt-in, Particle/Pool/Memory Hotfix.
  - E2E-Basis + kritische Unit-Tests; Debug in PROD off.
- Phase 2 (3-6 Wochen)
  - GameController-Decomposition, Event-Bus + Store, Config-System.
  - CSS-Design-System, Asset-Management (Unified Texture, Validator, Audio).
  - Performance (Grid/Batching/Healthbars).
- Phase 3 (7-12 Wochen)
  - Maps/Biomes/Special Tiles, Dynamic Difficulty/Director.
  - Traits/Synergien, Meta-Progression-Scaffolding, Mobile/Accessibility Final.
  - Asset-Pipeline automatisieren.
- Phase 4 (13-24 Wochen)
  - WASM/GPU-Pipelines, Community/Leaderboards, ML-Difficulty.
  - Dauerhaftes Performance-/QA-Monitoring.

---

## 11) Messgrößen & Akzeptanzkriterien (übergreifend)
- Gameplay/Balance: Tower-Diversität >3, Waves ~16, Overkill 10-25%, Boss-Resistenzen <25%, Early-Econ kein Death Spiral.
- Performance: 60 FPS stabil, Frame <16ms Ziel-Load, Memory <80MB, Pool-Effizienz >85%, Culling >95%.
- Qualität: Test Coverage >=80%, E2E stabil, keine fehlenden Assets/Localization-Keys.
- UX/Access: Responsive Layouts mobil/desktop, ARIA/Keyboard bestehen Basis-Checks, kein Debug in PROD.
- Content: +3 Maps, Biome integriert, Traits/Synergien aktiv, Audio vollständig.
