# Assets & Graphics – aktueller Stand und nächste Schritte

## Eingebunden und funktionierend
- **Towers (Build L1 + Shop):** indica, sativa, support, sniper, flamethrower, chain (`/public/towers/*.png`).
- **Enemies & Badges:** alle aktuellen Enemy-Sprites inkl. fast/armored/boss/shielded/swarm-Badges.
- **Projectiles:** impact, volley, support bolt (`/public/projectiles/*.png`), werden als Sprites gerendert (Trail + Rotation).
- **Effects:** impact_spark Spritesheet (30 Frames), splash_indicator Overlay, dot_burn_overlay(_2) für DoT/Burn, motion_trail/shield/boss_glow.
- **UI / Icons:** money/lives/score/wave/speed, Buttons (primary/secondary).
- **Terrain:** grass_base, wood_base, path_straight (jetzt genutzt für Pfad).

## Offene / sinnvolle nächste Assets
- **Tower Upgrades (Level 2/3 Builds):** Alle Tower besitzen L2/L3-PNGs, aber aktuell wird L1 genutzt. Entweder neue Artworks erstellen oder die vorhandenen L2/L3-Sprites aktiv verdrahten.
- **Shop/HUD-Ergänzungen:** Upgrade-Badges (L1/L2/L3) als SVG, kleine HUD-Icons für Range/Splash/Slow/Pierce/DoT/Control.
- **Path/Grass-Variation:** Zusätzliche Path-Varianten (T-Junction/Transition) und 1–2 Grass-Overlays für Wiederholungsbrechung.
- **Enemy VFX:** Stealth/Regenerator/Splitter-spezifische Overlays (Pulse/Fade), einfache SVG-Pulse für Boss-/Shield-Badges.
- **Audio-Hinweis-Icons:** Wave-Bounty/Coin-Symbol für No-Leak-Bonus, kleines Warn-/Info-Icon für Intel-Popover.
- **Future VFX:** Kettenschlag/Blitz-Decal (Chain), Flammenkegel-Decal (Flamethrower), optional AoE-Ring in mehreren Größen.
