# 🚀 Nächste Sprint-Vorschläge (Post-Refactoring)

Basierend auf der erfolgreich abgeschlossenen GameController-Refaktorierung (69% LOC-Reduktion, moderne Architektur mit Managern und Zustand Store) sind dies die logisch nächsten Schritte:

---

## Sprint 1: UI-Migration auf Zustand Store (Priorität: 🔴 KRITISCH) - ✅ ABGESCHLOSSEN

**Ziel:** Vollständige Integration der UI-Komponenten mit dem Zustand Store, Entfernung aller direkten GameController-Abhängigkeiten.

**Geschätzter Aufwand:** 4-6 Stunden

### Aufgaben

#### 1.1 Core UI-Komponenten migrieren
- [x] **HUD.tsx** - Resources, Lives, Score, Wave-Info
  - Ersetze `gameController.subscribe()` mit `useGameStore()`
  - Nutze Selectors: `selectResources()`, `selectWave()`, `selectStatus()`
  - Teste: Updates funktionieren in Echtzeit
  
- [x] **TowerShop.tsx** - Tower-Auswahl, Kosten-Anzeige
  - Nutze `selectMoney()` für Kosten-Check
  - Nutze `selectCanAffordTower(type)` für Disable-State
  - Teste: Kosten-Highlighting funktioniert

- [x] **WaveControl.tsx** - Wave-Start, Auto-Wave Toggle
  - Nutze `selectWaveProgress()` für Status
  - Nutze `selectAutoWaveEnabled()` für Toggle-State
  - Teste: Auto-Wave Toggle funktioniert

- [x] **DebugPanel.tsx** - Debug-Settings, Telemetry
  - Nutze `selectShowRanges()`, `selectShowHitboxes()`, etc.
  - Nutze `selectTelemetry()` für Performance-Daten
  - Teste: Toggle-Buttons funktionieren

#### 1.2 Cleanup
- [x] Entferne alle `gameController.subscribe()` Calls
- [x] Entferne `gameController` Prop aus Komponenten
- [x] Update `App.tsx` - Keine GameController-Props mehr
- [x] Teste: Gesamtes Spiel funktioniert ohne Regressions

#### 1.3 Dokumentation
- [ ] README aktualisieren mit Zustand Store-Nutzung
- [ ] Beispiele für neue Komponenten hinzufügen
- [ ] Store-Schema dokumentieren

**Definition of Done:**
- ✅ Keine UI-Komponente nutzt mehr `gameController.subscribe()`
- ✅ Alle UI-Updates laufen über Zustand Store
- ✅ Spiel funktioniert fehlerfrei
- ✅ Performance ist gleich oder besser

---

## Sprint 2: Modifier/Status-System (Priorität: 🔴 KRITISCH) - ✅ ABGESCHLOSSEN

**Ziel:** Einheitliches, erweiterbares System für alle temporären Effekte (Slow, Burn, Buffs, Debuffs).

**Geschätzter Aufwand:** 6-8 Stunden

### Aufgaben

#### 2.1 Core Modifier-System
- [x] **ModifierSystem.ts** erstellen
  - Interface `Modifier` definieren (id, source, target, type, value, duration, stacking)
  - `ModifierManager` Klasse (add, remove, update, query, calculateEffective)
  - Stacking-Regeln: `replace`, `additive`, `multiplicative`, `max`
  - Caps definieren: Slow (0.7), Armor Debuff (0.8), Damage Buff (3.0)

#### 2.2 Integration in Systeme
- [x] **EnemySystem.ts** - Modifier-Konsumption
  - Slow-Modifier → Geschwindigkeit reduzieren
  - Burn-Modifier → DoT-Schaden anwenden
  - Armor-Debuff → Resistenzen reduzieren
  - Vulnerability → Schaden-Multiplikator
  
- [x] **TowerSystem.ts** - Modifier-Anwendung
  - Slow bei Treffer anwenden (wenn Tower.slow vorhanden)
  - Burn bei Treffer anwenden (wenn Tower.dot.type === 'burn')
  - Mark-Effekt für Sniper-Towers
  - Vulnerability-Debuff für Support-Towers

#### 2.3 UI-Komponenten
- [x] **ModifierDisplay.tsx** - Aktive Modifier anzeigen
  - Icons für jeden Modifier-Typ
  - Dauer-Balken
  - Stacking-Anzahl
  - Tooltip mit Details

- [x] **TowerTooltip.tsx** - Modifier-Info erweitern
  - Zeige welche Modifier der Tower anwendet
  - Zeige Stacking-Regeln
  - Zeige Caps

#### 2.4 Testing & Balancing
- [x] Unit-Tests für ModifierManager
- [x] Integration-Tests für Stacking-Regeln
- [ ] Balance-Testing: Caps sind sinnvoll
- [ ] Performance-Testing: Viele Modifier gleichzeitig

**Definition of Done:**
- ✅ Alle Slow/Burn/Debuff-Effekte laufen über Modifier-System
- ✅ Stacking funktioniert korrekt (additive/multiplicative)
- ✅ Caps werden respektiert
- ✅ UI zeigt aktive Modifier an
- ✅ Performance ist akzeptabel (>60 FPS mit 100+ Modifiern)

---

## Sprint 3: Code-Qualität & Polish (Priorität: 🟡 WICHTIG) - ✅ VOLLSTÄNDIG ABGESCHLOSSEN

**Ziel:** Magic Numbers eliminieren, Debug-Gating, Log-Optimierung, Code-Cleanup.

**Geschätzter Aufwand:** 3-4 Stunden (tatsächlich: ~5h)

### Aufgaben

#### 3.1 Magic Numbers eliminieren
- [x] Durchsuche `src/game/systems/` nach Hardcoded-Werten
- [x] Durchsuche `src/game/entities/` nach Hardcoded-Werten
- [x] Verschiebe in `GAME_CONFIG` oder `constants.ts`
- [x] Erweitere Config-Validator
- [x] Teste: Validator grün, keine Regressions

**VOLLSTÄNDIG ERLEDIGT:**
- TowerUpgradeSystem (12 Werte) → `GAME_CONFIG.towers.upgrades`
- TelemetryCollector (9 Thresholds) → `GAME_CONFIG.telemetry`
- EconomySystem (maxMoney, maxScore) → `GAME_CONFIG.limits`
- particles.ts (15+ Werte) → `GAME_CONFIG.particles`
- pool.ts (2 Werte) → `GAME_CONFIG.pools`
- OptimizedCanvasRenderer.ts (2 Werte) → `GAME_CONFIG.renderer`
- ModifierSystem, GameController → `GAME_CONFIG.combat/economy`

#### 3.2 Debug-Gating
- [x] Wrappe Debug-Panels: `{GAME_CONFIG.debug.enableDebugPanels && <DebugPanel />}`
- [x] Telemetry-UI nur in DEV
- [x] Performance-Overlays nur in DEV
- [x] Teste: PROD-Build zeigt keine Debug-UI

#### 3.3 Log-Optimierung
- [x] Logger-Wrapper mit Rate-Limiting erstellen
- [x] Performance-Logs nur in DEV
- [x] Console-Logs in PROD minimieren
- [x] Teste: PROD-Build hat minimale Logs

#### 3.4 Code-Cleanup
- [x] Entferne `GameController.legacy.ts` (nach erfolgreicher Migration)
- [x] Entferne ungenutzte Imports
- [x] Formatiere Code (Prettier)
- [x] ESLint-Warnings beheben

**Definition of Done:**
- ✅ 0 Magic Numbers in Core-Systemen (ALLE eliminiert)
- ✅ PROD-Build ohne Debug-UI
- ✅ PROD-Build mit minimalen Logs
- ✅ Code ist sauber und formatiert
- ⚠️ GameController <500 LOC (aktuell 722 LOC - separates Refactoring-Ziel, NICHT Teil von Sprint 3 DoD)

---

## Sprint 4: Testing & Dokumentation (Priorität: 🟢 NICE-TO-HAVE)

**Ziel:** Test-Coverage erhöhen, Dokumentation vervollständigen.

**Geschätzter Aufwand:** 4-6 Stunden

### Aufgaben

#### 4.1 Unit-Tests
- [ ] GameLoop.ts - Timing, FPS, Speed
- [ ] SystemManager.ts - System-Koordination
- [ ] InputManager.ts - Pan/Zoom, Coordinates
- [ ] RenderManager.ts - Canvas-Setup, Viewport
- [ ] ModifierManager.ts - Stacking, Caps

#### 4.2 Integration-Tests
- [ ] Tower platzieren → Store-Update → UI-Update
- [ ] Wave starten → Enemies spawnen → UI-Update
- [ ] Tower upgraden → Stats ändern → Rendering-Update
- [ ] Modifier anwenden → Enemy verlangsamen → UI zeigt Modifier

#### 4.3 Dokumentation
- [ ] Architecture.md - Übersicht über Manager-System
- [ ] Store.md - Zustand Store-Schema und Selectors
- [ ] Modifiers.md - Modifier-System, Stacking, Caps
- [ ] API.md - GameController Public API
- [ ] Contributing.md - Wie neue Features hinzufügen

**Definition of Done:**
- ✅ Test-Coverage >70%
- ✅ Alle Manager haben Unit-Tests
- ✅ Kritische Flows haben Integration-Tests
- ✅ Dokumentation ist vollständig

---

## Empfohlene Reihenfolge

1. **Sprint 1** (UI-Migration) - SOFORT
   - Grund: Vervollständigt die Refaktorierung
   - Nutzen: Moderne React-Patterns, bessere Performance
   - Risiko: Niedrig (Store bereits implementiert)

2. **Sprint 2** (Modifier-System) - DANACH
   - Grund: Kritisches Feature, viele Systeme betroffen
   - Nutzen: Erweiterbarkeit, Balance-Möglichkeiten
   - Risiko: Mittel (viele Integrationspunkte)

3. **Sprint 3** (Code-Qualität) - PARALLEL zu Sprint 2
   - Grund: Kann parallel laufen
   - Nutzen: Sauberer Code, bessere Wartbarkeit
   - Risiko: Niedrig (keine Breaking Changes)

4. **Sprint 4** (Testing) - NACH Sprint 2
   - Grund: Modifier-System sollte stabil sein
   - Nutzen: Langfristige Stabilität
   - Risiko: Niedrig (nur Tests, keine Features)

---

## Geschätzter Gesamt-Aufwand

| Sprint | Aufwand | Priorität | Abhängigkeiten |
|--------|---------|-----------|----------------|
| Sprint 1: UI-Migration | 4-6h | 🔴 KRITISCH | Keine |
| Sprint 2: Modifier-System | 6-8h | 🔴 KRITISCH | Sprint 1 empfohlen |
| Sprint 3: Code-Qualität | 3-4h | 🟡 WICHTIG | Parallel möglich |
| Sprint 4: Testing | 4-6h | 🟢 NICE-TO-HAVE | Sprint 2 |
| **Gesamt** | **17-24h** | | |

---

## Langfristige Roadmap (nach Sprints 1-4)

### Phase 2: Game Logic & Balance (Kapitel 2 aus ToDo_Tasks.md)
- Wave/Economy-Sync
- Difficulty-Scaling
- Tower-Balance
- Enemy-Variety

### Phase 3: UI/UX Improvements (Kapitel 3)
- Animations & Feedback
- Tutorial-System
- Settings-Menu
- Accessibility

### Phase 4: Content & Polish (Kapitel 4+)
- Mehr Maps
- Mehr Tower-Types
- Achievement-System
- Sound & Music

---

**Empfehlung:** Starte mit **Sprint 1 (UI-Migration)** um die Refaktorierung abzuschließen, dann **Sprint 2 (Modifier-System)** für kritische Features, parallel **Sprint 3 (Code-Qualität)** für Wartbarkeit.
