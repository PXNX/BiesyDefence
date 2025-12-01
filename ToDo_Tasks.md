## UI To-Do / offene Baustellen

- Theme konsolidieren: Farben/Abstufungen aus `src/assets/theme.ts` + CSS-Variablen konsequent nutzen, Hardcodes (z. B. `#90EE90`, diverse `rgba(...)`) in Komponenten und Inline-Styles ersetzen, damit Look zentral anpassbar bleibt.
- Responsiveness verbessern: Fixbreiten/Fixed-Positionen abbauen (`TOWER_DETAILS_PANEL_WIDTH`, TowerRadialMenu 220x220, CornerStatCards fixed, `side-dock-panel`/`info-bar` absolut), Breakpoints für kleinere Screens ergänzen, Canvas/HUD skalierbar halten.
- Shop/Tower-UX fertigstellen: Platzhalter-Assets (PLACEHOLDER_SHOP) durch finale Art ersetzen, BASE_URL-sichere Pfade verwenden, Tower-Auswahl klar von Bauen trennen, saubere Disabled-/“Out of Money”-States und Fokus-/Hover-Feedback einbauen.
- Asset-/Texture-Probleme beheben: Sprites/Overlays/Badges neu exportieren (korrekte Alpha, keine Backplates), Dateigrößen reduzieren oder WebP/Atlas nutzen, konsistente Mappings (CanvasRenderer/OptimizedCanvasRenderer) und Fallbacks einführen, um “Quadrate”/leere Rechtecke zu vermeiden.
- Encoding-/Copy-Bugs fixen: Ersetze fehlerhafte Zeichen (`�`, ``) in Toasts/Wave-Intel/Tower-Stats mit korrekten Separatoren/Symbolen; sicherstellen, dass Dateien UTF-8 und Zeichenfolgen sauber sind.
- Icon-/Placeholder-Bereiche schließen: `??`/`?` in CornerStatCards/Achievements ersetzen, einheitliches Icon-Set (SVG bevorzugt) für HUD/Achievements/Stats nutzen statt Raster-Hintergründe.
- Lokalisierung durchziehen: Strings außerhalb von `App.tsx` (GameControlPanel, TowerIconBar, UpgradePanel, TowerRadialMenu, Achievement*) an `TranslationService` anbinden oder klare Primärsprache definieren, um gemischte EN/DE-Texte zu vermeiden.
- Layout/Overlays zugänglicher machen: Fokus-Falle und `aria-hidden` für Hintergrund bei Start/GameOver-Overlays konsistent setzen; Radialmenü und andere Controls tastaturbedienbar machen.
- Styling vereinheitlichen: Globale Styles vs. component `<style>`-Blöcke/TowerRadialMenu.css/UpgradePanel.css harmonisieren, Shadow/Glassmorphism/Borders zentral definieren; PNG-Button-Backplates (`/ui/buttons/...`) durch CSS-Varianten ersetzen.
- Debug/Telemetry drosseln: TelemetryPanel/EnhancedDebugPanel standardmäßig ausblenden oder in Dev-Only-Modus verschieben, um Spieler-HUD zu entschlacken.
- Feedback/States ausbauen: Klarere Hover/Active/Disabled-Visuals für Audio-Regler, Speed-Chips, Shop-/Upgrade-Buttons; lebendige Micro-Interaktionen hinzufügen, ohne Lesbarkeit zu verlieren.

## QA / Perf / Tests
- Headless/Autoplay pro Difficulty ausweiten (lange Läufe), perf-Snapshots und 404/Asset-Checks automatisieren; E2E für Wave-Transitions + Economy-Regressions ergänzen.
- Resist/Slow-Cap/Streak Unit-Checks ergänzen; fehlende Preload/404-Sweeps für neue Icons/Badges/Projectiles/Effekte nachziehen.

## Maps & Content
- Neue Map-Layouts bauen (Misty/Terraced/Circular o. Ä.) mit Graph-basiertem Pfad (Splits/Joins/Loops) und Doppel-Spawn-Variante gemäß `docs/maps_plan.md`.
- Tileset-Switch/Biome verankern (Wald/Steppe/Sumpf zunächst), inkl. 3× Gras/Pfad/Overlay-Texturen pro Biome; `TEXTURE_PATHS` erweitern.
- Spezial-Tiles (Rune +Range, Gold-Well +Income) weiter pflegen und UI-Hints im HUD sicherstellen; Map-Mods-Feld (HP/Speed/Reward/TowerCost Multiplikatoren) nutzen.
- Renderer/Placement: Multi-Pfad-Rendering + Validierung (kein Blocken), Deko-Layer, Range-Preview intakt halten.
- Optional (Iteration 2+): leichte Map-Events (Wind/Nebel/Regen) und interaktive Elemente (Fässer/Fallen) vorbereiten.

## Balance & Telemetrie
- Difficulty-Tuning per Telemetrie weiterführen; Heatmaps/zusätzliche Metrics bei Bedarf ergänzen.
- HP/Reward per Difficulty feinschleifen nach neuen Maps/Events.

## Audio / UX Polish
- Musik-Loops/Ducking/Mix-Pass liefern; Audio-Hooks überprüfen.
- Accessibility/Tooltips/Localization-Pflege nach neuen Strings/Assets.

## Upgrades & Assets (Feinschliff)
- Branch-Cosmetics (Scope/Emitter/Coils/Nozzle/Focus/Armor-Decal) optional hinzufügen, um Perk/Branch-Lesbarkeit im Renderer zu verbessern.
- Map-Events/Branch-Overlays (tint/overlay pro Branch) optional ergänzen.
