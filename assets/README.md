# Asset-Struktur für Tower Defence Spiel

Diese Ordner enthalten alle grafischen Assets für das "Phased Bio-Defense" Tower Defence Spiel.

## Ordnerstruktur

```
assets/
├── backgrounds/          # Hintergrundbilder und Umgebungen
├── towers/              # Tower-Sprites und Animationen
├── enemies/             # Feind-Sprites und Animationen
├── textures/            # Weg- und Oberflächen-Texturen
├── ui/                  # UI-Elemente, Icons und Interface-Assets
├── effects/             # Spezialeffekte, Partikel und Explosionen
└── README.md            # Diese Datei
```

## Verwendung

Alle Assets sollten in den entsprechenden Unterordnern platziert werden. Die Dateibenennung folgt einem konsistenten Schema:

- **Texturen**: `grass_01.png`, `path_straight_01.png`, `path_corner_01.png`
- **Türme**: `tower_indica_base.png`, `tower_sativa_level2.png`
- **Feinde**: `enemy_pest_idle.png`, `enemy_runner_walk_01.png`
- **UI**: `icon_money.png`, `button_primary_normal.png`, `button_primary_hover.png`

## Farbpalette

Die Assets sollten die Farbpalette des Spiels berücksichtigen:
- Background: `#010b04` (sehr dunkelgrün)
- Grass: `#1f4d22` (mittelgrün)
- Path: `#7f6a3f` (braun-ocker)
- Accent: `#a8f57f` (hellgrün)

## Technische Anforderungen

- **Format**: PNG mit Transparenz
- **Größe**: Für Texturen 256x256px oder 512x512px
- **Skalierbarkeit**: Vektor-Assets für UI-Elemente bevorzugt
- **Optimierung**: Für Web-Performance optimiert