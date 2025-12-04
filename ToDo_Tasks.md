# ToDo Tasks – BiesyDefence (alle Befunde aus Qwen, Grok 4.1, GLM 4.6, GPT-Codex, Gemini, MiniMax)

Ziel: Vollständige Abarbeitung aller offenen Punkte, sodass das Spiel auf AAA-Niveau kommt. Jede Sektion enthält: Ziele, Kernaufgaben, Teilaufgaben, Definition of Done (DoD).

---

## 1) Fundament & Architektur
**Ziel:** Entfernen des God-Objects, klare Verantwortlichkeiten, konfigurierbare Systeme, saubere Trennung UI/Logik.
- GameController-Refactor
  - Aufsplitten in GameManager, SystemManager, RenderManager, InputManager, EventBus, GameLoop.
  - DoD: GameController <500 LOC, keine Spiellogik/Rendering/Input direkt darin.
  - **Status:** EventBus eingebaut, zentrale Config eingeführt. Vollständige Aufteilung und Shrink <500 LOC offen.
- State-Management & Events
  - Zentraler Store (z.B. Zustand) als Single Source of Truth; EventBus (mitt/tiny-emitter) für System-Kommunikation.
  - UI liest ausschließlich aus Store/Selectors; keine direkten Systemaufrufe aus Komponenten.
  - DoD: Keine doppelten State-Quellen UI/Game; Events dokumentiert.
  - **Status:** EventBus für HUD-Dispatch aktiv. Store-Anbindung/UI-Selectors offen.
- Konfigurationsdrehscheibe
  - `GAME_CONFIG`/`GAME_CONSTANTS` für Performance (step, delta max), Balance (Tower/Enemy/Economy), UI (Layout-Tokens), Debug.
  - Magic Numbers entfernen; Runtime-Validierung der Config.
  - DoD: 0 Magic Numbers in Kernsystemen; Config-Validator grün.
  - **Status:** GAME_CONFIG + Validator implementiert; Loop/Zoom/Pan/Throttle/Auto-Wave daran gebunden. Weitere Magic Numbers bereinigen.
- Modifier/Status-System
  - Einheitliches Modifier-Pattern (ID, Quelle, Ziel, Typ flat/percentage, Dauer, Caps, Stacking-Regeln).
  - Konsumiert von Enemy-/Tower-/Trait-System; UI kann aktive Modifier anzeigen.
  - DoD: Slow/Burn/Armor/Mark-Effekte laufen über Modifier-System; Caps und Stacking dokumentiert.
  - **Status:** Offen.
- Prod/Dev-Trennung
  - Debug-/Telemetry-Panels nur in DEV; Logging/`performance.now()` Sampling nur Debug.
  - DoD: PROD-Build ohne Debug-Panels/Spam-Logs; ENV-Flags getestet.
  - **Status:** Telemetry per Config abschaltbar; Debug-Flags in Config. UI/Panel-Gating und Log-Drosselung offen.

---

## 2) Game Logic & Systeme
**Ziel:** Korrekte, transparente Spielmechaniken, robuste Flows.
- Wave/Economy-Sync
  - Rewards an HP-Scaling koppeln; Economic Death Spiral entfernen.
  - DoD: HP- und Reward-Skalierung aus gleicher Quelle; Tests decken das ab.
  - **Status:** Offen (keine gekoppelte Reward/HP-Skalierung, keine Tests).
- Auto-Wave Opt-in
  - Grace-Phase vor Start; Auto-Wave standardmäßig aus; UI-Option sichtbar.
  - DoD: Spieler hat Bau-Puffer; Auto-Wave toggelbar; E2E-Test vorhanden.
  - **Status:** Default auf AUS via GAME_CONFIG; Grace/UX/Test offen.
- Route-Inheritance
  - On-death Spawns behalten Route/Index.
  - DoD: Multi-Path-Maps korrekt; Test für Splitter/Spawner.
  - **Status:** Route/Index-Vererbung für Wave-Spawn + On-Death-Spawns implementiert; Tests fehlen.
- Map-Modifier aktivieren
  - EnemySpeed/Reward/TowerCost/Range/Fog/Wind anwenden; HUD-Banner spiegeln Werte.
  - DoD: Modifier wirken in Systems und UI; Tests pro Modifier.
  - **Status:** Offen.
- Enemy Traits
  - Healer/Spawning/Teleport/Aggro als Traits; Ausführung im EnemySystem.
  - DoD: Mindestens 2 Traits aktiv getestet; keine Regressionen.
  - **Status:** Offen.
- Tower Synergien
  - Mark/Exploit (Öl+Feuer, Säure+Plasma), Support-Procs; UI zeigt aktive Synergien/Markierungen.
  - DoD: Synergie-Effekte sichtbar, stacken gemäß Regeln; Tests vorhanden.
  - **Status:** Offen.
- Director/Dynamische Waves (später)
  - Budget-basierte Mini-Events, variable Routen, Elite-Mods (optional Phase 3+).
  - **Status:** Offen (Phase 3+).

---

## 3) Balancing & Economy
**Ziel:** Faire, datenbasierte Balance, klare Formeln, dokumentierte Regeln.
- Emergency-Balance
  - Support Nerf (~-40% DMG, -13% Range), Sativa Fire Rate 1.0, Startgeld 200, Wave 1-2 Rewards +25%, Boss-Resistenzen <25%.
  - DoD: Werte im Config; Smoke-/E2E-Test Early Game grün.
- Balance-Bibel
  - Formeln für Schaden/Armor/Slow-Caps/Stacking/Upgrade-Kosten dokumentieren; zentrale Balance-Datei ohne Magic Numbers.
  - DoD: Dokument + Tests, die Formeln validieren.
- Income-Stacking
  - Multiplikativ statt additiv; Rewards pro Enemy-Typ angleichen; Upgrade-Kosten für dominante Türme erhöhen.
  - DoD: getIncomeMultiplier multiplicative; Test deckt mehrere Gold-Wells ab.
- Difficulty Curve
  - Wellen 1-5 leichter, 6-10 moderat, 11-15 anziehend, 16-20 fordernd; datengetriebene Templates.
  - DoD: Wave-Config versioniert; Tests für HP/Speed/Reward-Skalierung.
- Telemetrie für Balance
  - Events: `tower_built`, `tower_upgraded`, `tower_sold`, `enemy_destroyed`, `player_defeated`; Heatmaps (Placement/Deaths).
  - DoD: Events gesendet, Dashboard/Export möglich; KPI berechenbar.
- KPI-Ziele
  - Tower-Diversität >3, Avg Waves ~16, Overkill 10-25%, Retention >60%.

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
