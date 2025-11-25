# Map-Roadmap: Abwechslung, Strategie, Zukunftssicherheit

Ziele: Mehr Routenvielfalt, strategische Platzierung, visuelles Flair. Kurzfristig konfigurierbar, langfristig erweiterbar mit Biome-/Effekt-System und Spezial-Gegnern.

## Kernideen (kurzfristig umsetzbar)
- **Mehrwege & Verästelungen:** Pfad-Graph statt Linie (Splits, Rejoins, Schleifen). Mindestens 3 Map-Layouts: S-Kurve, Doppelpfad (Split/Join), Zickzack mit Engstellen.
- **Platzierungszonen & Engpässe:** Grasflächen variieren (Inseln, schmale Stege), 1-2 „High-Value“-Tiles pro Map (Bonus-Range oder -Gold), Blocker-Tiles für Deckung.
- **Spawn-/Exit-Varianten:** Links/Rechts/Oben/ Unten, auch Doppel-Spawn (abwechselnd) für mehr Targeting-Druck.
- **Difficulty-Mods pro Map:** Multiplikatoren für enemy HP/Speed/Reward, Build-Kosten-Bonus/Malus, spezielle „Wetter“-Modifier (leichter Slow oder Projectile Spread).
- **Tilesets/Biome (Grundversion):** Wald (grün), Steppe (ocker), Sumpf (dunkelgrün/braun), Tech-Lab (grau/blau). Je Biome 3 Texturen: Gras, Pfad, Deko-Overlay.

## Mittelfristige Features
- **Map-Events light:** Periodische Windböen (kurzer Range-Malus) oder Nebel (kurzer Sicht-/Range-Malus), Regen (leichter Slow auf Enemies, aber weniger DoT-Effizienz).
- **Interaktive Elemente:** Beschießbare Kisten/Fässer → kleiner Splash, Aktivierbare Fallen (Spike/Fireburst) mit Cooldown und kleinem Geldpreis.
- **Strategische Boni:** Mana-/Gold-„Wells“ (dauerhafter +5% Income), Runen-Tiles (Tower bekommt +Range oder +Slow-Stärke), aber begrenzt auf 1–2 Tiles.
- **Pfad-Tagging:** Abschnitt-Tags (Sumpf, Tech, Frost) die Resistenz-/Vulnerability-Mods für Enemies aktivieren, um Tower-Kombos zu motivieren.

## Gegnervarianten passend zu Maps
- **Terrain-Resist/Weakness:** Sumpfgegner langsam aber DoT-resist; Tech-Drohnen schnell, schwach gegen Slow; Frost-Gegner resistent gegen Slow, schwach gegen Burn.
- **Pfadreaktionen:** Gegner mit Weg-Buffs (schneller auf Straße, langsamer im Sumpf), Tunnel-/Brücken-Abschnitte mit kleiner HP-Reduktion bei schweren Gegnern.

## Assets & Technik
- **Texturen:** Pro Biome min. 3 Tiles (Gras/Boden/Pfad) + 2 Deko-Overlays (Steine, Wurzeln). Ablage `public/textures/<biome>/*`; `TEXTURE_PATHS` erweitern.
- **Map-Datenmodell:** 
  - Pfad als Graph (Nodes + Edges, optionale Tags). 
  - Tiles mit Typ (path/grass/blocker/special) + optionalem Modifier (buff/debuff).
  - Biome-Feld für Tileset-Switch.
- **Renderer:** Multi-Pfad-Support (keine Annahme „eine Linie“), einfache Deko-Layer über Pfad/Gras. Range-Preview muss weiter funktionieren.
- **Wave-System:** Mehrere Spawnpunkte/Exits pro Map; Routing pro Gegner (primärer Pfad, ggf. Random-Split). 

## Minimaler erster Schritt (Iteration 1)
1. Drei Map-Configs mit Graph-basiertem Pfad (Split/Join/Loop) + Doppel-Spawn-Variante.
2. Tileset-Switch: Wald/Steppe/Sumpf (3× Gras/Pfad/Overlay in `TEXTURE_PATHS`).
3. Spezial-Tiles: „Rune +Range“, „Gold-Well +Income“; 1–2 pro Map; UI-Hint in HUD.
4. Map-Modifier-Feld in `MapManager`: enemyHpMult, enemySpeedMult, rewardMult, towerCostMult.
5. Renderer: Pfad-Graph zeichnen, Deko-Layer; Placement validieren (keine Pfad-Blockade).

## Spätere Iteration (Iteration 2+)
- Events (Wind/Nebel/Regen) als zeitlich begrenzte Map-Mods; UI-Banner/FX.
- Fallen/Fässer als interaktive Entities mit Cooldown.
- Terrain-Tags + Enemy-Tag-Interaktion (Resist/Vuln pro Abschnitt).

## QA/Tests
- Pfad-Validierung: Enemies können von jedem Spawn zu jedem Exit; keine Dead-Ends (außer bewusst mit Teleporter/Falle später).
- Placement-Check: Tower nur auf erlaubten Gras/Spezial-Tiles; Blocker bleiben unplatzierbar.
-,Wave-Rotation: Doppel-Spawn alternierend, keine Wave hängt.
- Performance: Multi-Pfad bei 50+ Enemies stabil; Renderer keine massiven Overdraw-Probleme mit Dekos.
