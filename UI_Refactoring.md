# UI Refactoring & Map Expansion Plan

Dieser Plan fasst alle Änderungen zusammen, die notwendig sind, um das Spielfeld massiv zu vergrößern, eine moderne, platzsparende HUD-/Tower-Bedienung zu schaffen und Zoom/Pan-Interaktionen mit festen Grenzen umzusetzen. Er dient als Umsetzungs-Backlog für die UI- und Gameplay-Agenten.

---

## 1. Ausgangslage & aktuelle Probleme

- **Spielfeldgröße** – Das Standard-Grid ist aktuell `12 × 8` Kacheln bei `cellSize = 70` (`src/game/maps/MapManager.ts:46-70`). Dadurch ist die Gesamtfläche nur 840 × 560 Welt-Einheiten und lässt kaum Raum für komplexe Pfade.
- **Canvas-Darstellung** – Das Layout erzwingt eine linke Sidebar von 320 px (`.main-stage` in `src/index.css:91-117`), wodurch die Canvasfläche relativ klein und stark abhängig von der Fensterhöhe ist (`canvas` ist statisch auf `70vh` begrenzt).
- **HUD/Bars** – Die TopHUD-Komponente (`src/ui/components/TopHUD.tsx`) belegt einen vollen Sticky-Bereich mit opaker Fläche. Zusammen mit der linken Spalte schrumpft das Spielfeld optisch und wirkt nicht mittig.
- **Tower-Auswahl** – `TowerPicker` (`src/ui/components/TowerPicker.tsx:17-103`) zeigt komplette Karten mit Text und Tabellen; die Buttons sind hoch und nehmen die gesamte Sidebar-Länge ein. Es gibt keine Möglichkeit zum Einklappen oder für Tooltips-on-demand.
- **Kamera** – `CanvasRenderer.render(...)` skaliert die Map immer so, dass sie zu 93 % der verfügbaren Fläche passt (`src/game/rendering/CanvasRenderer.ts:418-469`). Zoom- oder Pan-Interaktionen existieren nicht. `GameController.screenToWorld` (ab Zeile 1066) rechnet ausschließlich mit diesem globalen Scale, daher fehlen die APIs für eine Kamera, die Grenzen und Benutzersteuerung respektiert.

---

## 2. Zielübersicht (Chef-Vorgaben)

1. **Map 45×30** – Deutlich größere Spielfläche mit komplexeren Pfaden und freieren Tower-Platzierungen.
2. **Maximale Spielfläche** – Das Spielfeld soll visuell den Hauptbereich einnehmen; HUD und Picker müssen dezent/transparent werden.
3. **Tower-Kaufbereich „leicht“** – Icons statt Karten, platzsparend, optional einklappbar, Infos erst beim Hoovern oder Aufklappen sichtbar.
4. **Zoom & Pan** – Mausrad-Zoom (rein/raus) plus begrenzte Kamerabewegung, sodass die Map stets im sichtbaren Bereich bleibt und nicht „wegscrollt“.

---

## 3. Spielfeld- & Kamera-Konzept

### 3.1 Neues Grid & Map-Daten

| Parameter            | Ist                               | Soll (Vorschlag)                                           | Bemerkung |
|----------------------|-----------------------------------|------------------------------------------------------------|-----------|
| Grid (Tiles)         | 12 × 8                            | 45 × 30                                                     | 4× mehr Fläche |
| `cellSize`           | 70                                | 48 (≈2/3 der alten Größe)                                  | Weltgröße 2160×1440, bleibt canvasfähig |
| Path Nodes           | Simpler Zickzack (6 Nodes)        | Mehrstufige Route mit Rückschleifen (z. B. 11–13 Nodes)    | siehe unten |
| Start-/End-Punkte    | Links → rechts                    | Start mittig links, Ziel rechts unten                      | Sorgt für diagonale Pfade |

**Pfad-Vorschlag:**  
`[(0,14) → (10,14) → (10,6) → (20,6) → (20,20) → (30,20) → (30,10) → (38,10) → (38,24) → (44,24)]`  
MapManager muss alle Zwischenknoten generieren (`generatePathGridKeys`). Die Breite/Segmente ermöglichen Wendungen und Engpässe für Tower.

### 3.2 MapManager & GameStateFactory Anpassungen

1. **`createDefaultMap`** (MapManager) – Breite, Höhe, `cellSize`, Farbschema und Pfadliste aktualisieren; neue `metadata` (Version 2.0) eintragen.
2. **`generateMapData`** – Sicherstellen, dass `worldWidth = width * cellSize` und `worldHeight = height * cellSize` nun 2160 × 1440 ergeben und dass `tileLookup` sowie `pathGridKeys` effizient bleiben (evtl. `Set` durch `Map` der neuen Größe).
3. **`createInitialState`** (`src/game/core/GameStateFactory.ts`) – Map-Instanz vom `MapManager` beziehen statt statische Konstanten zu verwenden, damit die neue Map sofort aktiv ist.
4. **Performance-Checks** – SpatialGrid (`src/game/utils/spatialGrid.ts`) nutzt aktuell `gridSize=64`. Für `cellSize=48` sollte `gridSize` auf 48 angepasst werden, damit Nachbarschaftsberechnungen deckungsgleich sind.

### 3.3 Kamera-/Zoom-System

1. **Camera State** – In `GameController` ein neues Objekt `camera = { scale: 1, targetScale: 1, minScale: 0.6, maxScale: 1.8, offset: { x: 0, y: 0 }, bounds: { ... } }` speichern. `scale` multipliziert den Map-Render-Scale aus dem Renderer (bisher `scale = min(width/worldWidth, height/worldHeight) * 0.93`).
2. **Input Handling**  
   - **Zoom**: `canvas.addEventListener('wheel', handleWheel)` – `deltaY` in `targetScale` übersetzen, sanft per Lerp Richtung `targetScale` animieren. Bei Zoom den Mauszeiger als Fokus nutzen (`worldPoint = screenToWorld`, offsets entsprechend verschieben).
   - **Pan**: Linke Maustaste + Space oder rechte Maustaste gedrückt halten → `dragState` startet, `camera.offset` wird verändert. Alternativ: Mittlere Maustaste.
   - **Reset/Center**: Taste `F` oder Doppel-Tap auf Canvas -> `camera.offset = center`.
3. **Bounds/Clamping** – Offsets müssen so begrenzt werden, dass immer mindestens die Map-Ränder sichtbar bleiben. Formel:  
   `visibleWidth = viewport.width / (baseScale * camera.scale)` → clamp offset zwischen `-(map.worldWidth - visibleWidth)/2` und `+(map.worldWidth - visibleWidth)/2`. Gleiches für Höhe.
4. **Renderer-Änderung**  
   - `CanvasRenderer.render` erhält optional `camera`-Parameter und multipliziert `scale = baseScale * camera.scale`. `offsetX/Y` werden um `camera.offset` transformiert.
   - `worldToScreen` nutzt `camera.offset` → `x = offsetX + (worldX + camera.offset.x) * scale`.
5. **GameController.screenToWorld** – Invers transformieren: `(screen - offsetX)/scale - camera.offset.x`.  
6. **Hover/Tower Placement** – Da `screenToWorld` jetzt die Kamera berücksichtigt, müssen `updateHover`, `placeTowerFromScreen`, etc. unverändert bleiben; sie profitieren automatisch von der neuen Transformation.
7. **Persistenter Zustand** – Beim Resize Map rezentrieren und `camera.targetScale = clamp(camera.scale)` neu berechnen.

### 3.4 UX-Verhalten

- **Initial View**: `camera.scale = 1` soll das Grid exakt mittig zeigen (zentriert).  
- **Zoom Steps**: 1.0 = default (45×30 sichtbar), 1.2 = näher ran, 0.8 = rauszoomen.  
- **Scroll Feedback**: Optional animierter HUD-Hinweis „Zoom 120 %“.  
- **Edge Guard**: Wenn Nutzer ganz rauszoomt, die Map weiterhin vollständig sichtbar halten (max. negative Offsets).

---

## 4. Layout-Redesign

### 4.1 Struktur-Blueprint

```
┌────────────────────────────────────────────────────────────┐
│ Transparent HUD (sticky, backdrop-blur)                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│           Fullscreen Canvas Container (centered map)       │
│                                                            │
│    ↳ Floating CTA buttons (Start/Pause/Speed)              │
│                                                            │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ Bottom Dock: Tower Icons + expandable details + tooltips   │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Transparente HUD

- **TopHUD weiterhin verwenden**, aber Hintergründe stärker transparent (z. B. `background: rgba(5,15,5,0.55)` plus `backdrop-filter`).  
- HUD soll keinen eigenen Block oberhalb des Canvas beanspruchen. Statt `<header>` außerhalb von `<main>` (aktuell `App.tsx:402-455`) wird die HUD absolut im Canvas-Container verankert (`position: absolute; top: 1rem; left: 50%; transform: translateX(-50%)`), so dass die Canvasfläche optisch bis ganz oben reicht.  
- `SpawnTicker` (aktuell im HUD eingebettet) wird als dünne Progress-Bar direkt am oberen Canvasrand platziert (`position: absolute; top: calc(hud-bottom); width: clamp(300px, 50vw, 640px)`).

### 4.3 Canvas & Stage Layout

- `main.main-stage` entfällt; stattdessen `<main className="game-stage">` erhält `display: flex; flex-direction: column; min-height: 100vh;`.  
- **Canvas Wrapper** (`.canvas-wrapper` ab `src/index.css:103-118`) wird zum responsiven Container mit `aspect-ratio` fallback: `min-height: 70vh`, `max-height: calc(100vh - 240px)` und `padding` reduziert, so dass 90 % des Viewports für das Spielfeld reserviert sind.  
- DebugPanel (DEV-only) wandert in einen `position: absolute; top: 1rem; right: 1rem` Container, um die Hauptfläche nicht zu blockieren.

### 4.4 Tower-Palette als Bottom Dock

1. **Komponente**: Neues `TowerPaletteDock` löst `TowerPicker` visuell ab. Aufbau:
   - **Collapsed State** (Default): 48 px hoher Streifen am unteren Rand (`position: sticky bottom: 0`, semitransparent, Icon-Buttons (40 px) für jeden Tower).
   - **Expand Interaction**:  
     - Hover oder Klick auf Icon → Floating Popover (über Canvas) mit Statistiken, Kosten, Upgrade-Vorschau (bestehende Inhalte von `TowerPicker`/`upgradeSummary`).  
     - Toggle-Button „Pin palette“ fixiert die erweiterte Ansicht.
2. **Information bei Bedarf**:  
   - Tooltips: `aria-describedby` + `Popover` (z. B. `role="dialog"`).  
   - Stats in 2 Spalten: Range, Schaden, Fire Rate, passives Tagline.
3. **Money Integration**: Im Dock eine kleine Pill „$123“ anzeigen, so dass Spieler beim Bauen nicht nach oben schauen müssen.
4. **CSS**: `backdrop-filter: blur(20px)`, `background: linear-gradient(180deg, rgba(2,12,4,0) 0%, rgba(5,15,5,0.85) 35%)`.  
5. **Responsiv**: Auf Mobile vollflächiges Sheet (`height: 160px`), Icons in horizontal scrollbarer Liste.

### 4.5 Kontextinformationen & Controls

- **Speed / Pause**: Direkt auf der HUD lassen oder als kleine Floating Buttons rechts unten im Canvas (`position: absolute; bottom: 140px; right: 40px`). Buttons nur Icons, mit Tooltip „1×, 2×, 4×“.
- **How-To / Overlays**: Vorhandene Overlays bleiben, müssen aber `z-index` > HUD erhalten, damit sie die transparente Leiste überlagern.
- **DebugPanel**: Optionales Slide-out (DEV) aus der rechten Seite; Standard-Spieler sehen ihn nicht.

---

## 5. Komponenten- & Style-Plan

| Aufgabe | Dateien/Module | Details |
|---------|----------------|---------|
| **Map Definition** | `src/game/maps/MapManager.ts`, `GameStateFactory.ts` | Grid-Parameter erhöhen, Pfad aktualisieren, Map-Ladepfad zentralisieren. |
| **Camera Hooks** | `src/game/core/GameController.ts`, `src/game/rendering/CanvasRenderer.ts` | `camera` State + Wheel/Pan Events, Transformationsmatrix, Clamping. `renderer.render` erhält `camera` Parameter; `screenToWorld` nutzt neue Werte. |
| **Canvas Layout** | `src/App.tsx` (um Zeile 402-520) | `<main>`-Layout umstellen: Canvas als Fullscreen-Section, HUD als Overlay, DebugPanel repositionieren, TowerDock unter Canvas einfügen. |
| **HUD Styling** | `src/index.css` (Abschnitt `.top-hud` ab Zeile 1217) | Padding/Hintergrund reduzieren, `position: absolute` + `pointer-events: none` (nur Buttons reaktiv). |
| **Tower Dock** | Neue Komponenten `TowerPaletteDock.tsx`, `TowerPopover.tsx`; CSS-Blöcke um Zeile 729 ersetzen | Bestehende `TowerPicker`-Logik (Geldprüfung, `upgradeSummary`) wiederverwenden, aber Layout auf Icons/Tooltips umstellen. |
| **SpawnTicker Placement** | `src/ui/components/SpawnTicker.tsx` + CSS | Komponente bleibt, aber CSS-Klasse `spawn-ticker` wird zu horizontaler Progressbar, die direkt unter der HUD hängt (`position: absolute`). |
| **Debug Panel Position** | `src/ui/components/DebugPanel.tsx`, CSS | Nur DEV: `position: fixed; top: 90px; right: 16px; width: 280px;` plus Hide-Button, damit Prod-Spieler nicht gestört werden. |
| **Animations & States** | `CSS` | Smooth transitions für Dock/HUD, `prefers-reduced-motion` berücksichtigen. |

---

## 6. Umsetzungsschritte (Roadmap)

1. **Map Backend**  
   1.1 `MapManager` Update (neue Dimensionen, Pfad, Theme)  
   1.2 `GameStateFactory` & `GameController` sicherstellen, dass Map-Instanz aus dem Manager geladen wird.  
   1.3 Tests: Enemies folgen vollständigem Pfad, Tower-Placement in Randbereichen funktioniert.
2. **Camera Layer**  
   2.1 Camera-State & Wheel/Pan Events in `GameController`.  
   2.2 Renderer-Refactor (`worldToScreen`, `screenToWorld`, `hover`).  
   2.3 Clamp-Logik + Reset Buttons.  
   2.4 QA: Zoom in/out, Pan, Boundaries prüfen.
3. **Layout Refactor**  
   3.1 `App.tsx`-Markup neu strukturieren (HUD overlay, Canvas fullscreen, Dock).  
   3.2 CSS passgenau anpassen (TopHUD, Canvas Wrapper, Body).  
   3.3 Responsive Tests (Desktop, Tablet, Mobile).
4. **Tower Dock & Tooltips**  
   4.1 Neue Komponente + Popover, alter `TowerPicker` entfernt.  
   4.2 Accessibility (Keyboard focus, ARIA).  
   4.3 Animationen (expand/collapse).  
5. **Polish**  
   5.1 SpawnTicker repositionieren.  
   5.2 DebugPanel in Floating Mode.  
   5.3 Visual QA, Performance (FPS), E2E (placing towers after zoom, start waves, etc.).

---

## 7. Risiken & Mitigation

- **Performance bei 45×30**: Mehr Tiles und größere Pfade erhöhen die Renderlast. Nutzung der bestehenden `OptimizedCanvasRenderer` (falls aktiv) prüfen; ggf. Culling aktivieren. FPS-Logging (`DebugPanel`) nutzen.
- **Input-Konflikte**: Zoom+Pan darf Tower-Platzierung nicht blockieren. Lösung: Drag nur bei gedrückter mittlerer Taste oder wenn kein Tower-Platzierungsmodus aktiv. Mausrad-Ereignisse `preventDefault` (passive: false) setzen.
- **HUD-Überdeckung**: Da HUD jetzt im Canvas liegt, Buttons könnten Klicks blockieren. `pointer-events: none` für Container, `pointer-events: auto` für Interaktive Sub-Elemente.
- **Tooltips auf Touch-Geräten**: Hover existiert nicht – Icons öffnen Popover bei Tap; erneuter Tap schließt diese wieder.
- **Center/Clamp Berechnung**: Bei extrem breiten Monitoren kann `visibleWidth > worldWidth` sein (dann Null-Division). Clamp-Formeln müssen diesen Sonderfall behandeln (`if visibleWidth >= worldWidth -> offset = 0`).

---

## 8. Test- & Abnahmekriterien

1. **Map Coverage**  
   - Alle Pfade sichtbar; Gegner laufen korrekt bis zur Basis.  
   - Tower können auf jeder Nicht-Pfad-Kachel gebaut werden, auch am Rand.
2. **Zoom/Pan**  
   - Mausrad zoomt smooth zwischen 60 % und 180 %.  
   - Drag (mittlere Maustaste / Space+Drag) verschiebt Karte, stoppt an Boundaries.  
   - Reset/Recentering funktioniert.
3. **Layout**  
   - HUD bleibt fixiert/transparent, Canvas füllt 80‑90 % des Screens.  
   - Bottom Dock überlagert Canvas, lässt aber Spielfeld sichtbar (transparenter Hintergrund).  
   - Tooltips zeigen Stats nach <150 ms, verbergen sich automatisch.
4. **Accessibility**  
   - Tabulator-Fokus erreicht alle HUD- und Dock-Elemente.  
   - ARIA-Labels für Icon-only Buttons.  
   - Dark/Light? – mind. 4.5:1 Kontrast.
5. **Responsivität**  
   - ≥1440 px: Canvas mittig, Dock 960 px breit.  
   - 768‑1440 px: Dock schrumpft, HUD reorganisiert in zwei Zeilen.  
   - <768 px: Dock wird Sheet, Canvas min. 55 vh, Zoom gesten (Pinch) optional.
6. **Regression**  
   - Start/Pause, Wave-Steuerung, Audio-Controls funktionieren unverändert.  
   - DEV DebugPanel weiterhin erreichbar (nur in `import.meta.env.DEV`).  
   - Keine JS-Errors bei Wheel/Pan, `pointer-lock` nicht nötig.

---

Mit diesem Plan können die Agenten Schritt für Schritt die Map vergrößern, die Kamera modernisieren und die UI reorganisieren, so dass das Spielfeld den Schwerpunkt bildet und trotzdem kontrollierbar bleibt.
