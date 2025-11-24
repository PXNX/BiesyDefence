# Assets & Graphics – aktueller Stand & Upgrade-Fahrplan

## Eingebunden und funktionierend
- **Towers (Build L1 + Shop):** indica, sativa, support, sniper, flamethrower, chain (`/public/towers/*.png`).
- **Enemies & Badges:** alle aktuellen Enemy-Sprites inkl. fast/armored/boss/shielded/swarm-Badges.
- **Projectiles:** impact, volley, support bolt (`/public/projectiles/*.png`) mit Trail/Rotation.
- **Effects:** impact_spark (30 Frames), splash_indicator, dot_burn_overlay(_2), motion_trail/shield/boss_glow.
- **UI / Icons:** money/lives/score/wave/speed, Buttons (primary/secondary).
- **Terrain:** grass_base, wood_base, path_straight.

## Upgrade-bezogene Assets (neu einplanen)
- **Perk/Branch-Icons (SVG/PNG 64px):**
  - Indica: Rupture (exploding shell), Penetrator (piercing bolt/armor crack).
  - Sativa: Shrapnel (fragment cloud), Focus (scope/crosshair).
  - Support: Cryo (snowflake/frost ring), Toxin (drop/skull).
  - Sniper: Pierce (arrow-through), Weakpoint (skull crosshair).
  - Flamethrower: Napalm (flask/puddle), Pressure (nozzle/psi gauge).
  - Chain: Storm (cloud+bolt/stun spark), Arc (forked lightning).
- **UI-Rahmen & Buttons (KR-Stil):**
  - Upgrade-Panel Frame (Holz/Metall), Branch-Linien/Connectoren, Lock/Affordable-State, Hover/Active-Glow.
  - Tier-Badges (L1/L2/L3) für HUD/Panel; kleine stat-Icons (Range/Splash/Slow/Chain/Crit/DoT).
- **VFX/Decals für Perks:**
  - Napalm-Pfütze (Burn-DoT auf Boden).
  - Shrapnel-Mini-Explosion (kleines AoE).
  - Storm-Stun-Spark (kleiner Blitz über Ziel).
  - Arc-Splash-Ring (Mini-Ring beim Arc-Hit).
  - Cryo-Freeze-Ring (hellblau, kurzer Root).
  - Toxin-Spread-Puff (grün/orange Nebel).
  - Weakpoint-Marker / Execution-Blip (kurzer Glow/Schädel).
- **Branch-Cosmetics (optional Overlay pro Tower):**
  - Sniper: Scope/laser overlay.
  - Support: Toxin-Tank vs. Cryo-Emitter.
  - Chain: Coil-Farbvariation (Storm=blau, Arc=violett).
  - Flamethrower: Nozzle/Pressure-Gauge, Napalm-Tank.
  - Sativa: Fragmented tip vs. Focused barrel.
  - Indica: Armor-shred decal vs. explosive shell tip.
- **Path/Grass-Variation (nice-to-have):** T-Junction/Transition und 1–2 Grass-Overlays für weniger Wiederholung (unabhängig von Upgrades, aber gut für Polishing).
- **Enemy VFX (Ergänzend):** Stealth/Regenerator/Splitter Overlays, Boss/Shield Puls (kann auch im Upgrade-Panel genutzt werden, z. B. Icon-Glows).

## Zu verdrahten/anzupassen
- Tower L2/L3-Build-Sprites vorhanden → in Renderer/Logic für Upgrade-Stufen nutzen (Fallback L1 bleibt).
- Neue Icons/VFX in `/public/ui/icons` bzw. `/public/effects` ablegen; TEXTURE_PATHS erweitern.
- Panel-UI benötigt Frame/Buttons/Bage/Stat-Icons; möglichst SVG für Tinting.

## Priorität / Reihenfolge
1) Icon-Set + UI-Frame (Panel benutzbar).
2) VFX für Perks mit Gameplay-Auswirkung (Napalm-Pfütze, Storm-Stun, Arc-Ring, Freeze/Toxin-Puff).
3) Branch-Cosmetics (optional) zur Lesbarkeit der Spezialisierung.
4) Terrain-Variationen & Enemy-Pulse (reiner Polish).
