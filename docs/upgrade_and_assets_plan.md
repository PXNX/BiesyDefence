# Upgrade & Assets Master Plan (aktualisiert)

Konsolidierte Infos aus früheren Plänen (ToDo, Balancing_Logic, Assets_Grafics, projectiles_effects_plan). Fokus: Upgrades/Perks, UI/VFX, Assets und Balancing.

## Ist-Stand im Spiel
- **Core-Systems:** Waves/Enemies/Economy/Resists/DoT/Slow/Vulnerability laufen; Streak/Wave-Bonus aktiv. Tower-Profile (Indica/Sativa/Support/Sniper/Flame/Chain) auf L1 balanciert.
- **Upgrades/Perks (Logik):** Daten in `config/upgrades.ts`, Stat-Recompute aktiv; Level/Perk-Kauf verdrahtet, Branch-Lock korrekt. Radial-UI am Tower vorhanden.
- **Perk-VFX:** Implementiert: Napalm-Pfütze, Toxin-Spread-Puff, Storm-Spark (nur VFX), Arc-Ring (nur VFX), Cryo-Ring (nur VFX), Shrapnel-Mini-Ring (VFX), Weakpoint/Execution Marker (VFX). Gameplay-Effekte für Stun/Arc-Splash/Mark-Bonus noch offen.
- **Renderer:** Tower-Sprites schalten auf L2/L3; Branch-Farbring. Map-Themes nutzen Farb-Tints; echte Tilesets pro Biome fehlen.
- **Assets eingebunden:** Tower L1–L3 (Build), Enemy-Sprites + Badges, Projectiles (impact/volley/support), Effects (impact_spark, splash_indicator, dot_burn_overlay), UI-Basics, Terrain (grass/wood/path). Perk-Icons PNGs in `/public/ui/icons/perks`.

## Offene Arbeit (Priorität)
1) **Upgrade-UI Feinschliff**
   - Hotkeys (Core 1/2/3, Branch-A Q/W, Branch-B E/R); Kauf-Toast/SFX; Stat-Icons im Radial/Panel; UI-Frame/Connectoren/Tier-Badges.
   - Optional: Branch-Cosmetics (Scope/Emitter/Coils/Nozzle/Focus/Armor-Decal).
2) **Perk-Logik & VFX abschließen**
   - Chain: Stun-Effekt (Storm) wirklich anwenden; Arc-Splash-Schaden/Falloff implementieren.
   - Mark/Weakpoint/Execution: Mark-Bonus im Combat verankern (z. B. Bonus-DMG-Fenster).
   - Shrapnel AoE-Schaden nach Aufschlag; Cryo-Effekt-Verstärkung; Toxin/Virulent Spread-on-Death sicherstellen.
3) **Assets für Upgrades/Perks**
   - UI-Frame (Holz/Metall), Stat-Icons, Tier-Badges. Perk-Icons vorhanden, aber Rahmen/Icons fehlen.
4) **Balancing & Tests**
   - Splash/DoT/Slow/Crit, Streak-Bonus, Bulwark/Carrier HP/Rewards feintunen.
   - Autoplay/Headless pro Difficulty (20 Waves); Unit-Checks Resist/Slow-Cap/Streak; UI-Tests Upgrade/Perk-Lock/Affordability.
5) **Nice-to-have**
   - Terrain-Variationen (Pfad/Gras), Enemy-Pulse/Stealth/Regenerator Overlays (Polish).

## UI/UX schnelle Gewinne (aus UI_Tasks destilliert)
- **Tower Interaktion & Feedback:** Selection-Glow, Build/Upgrade-Effekt (kurzer Glow/Particle), Projektil-Trails klarer färben; Radial-States (ready/locked/branch-locked) visuell unterscheiden.
- **Resource & Wave Clarity light:** Animierter Money-Tick + kurzer Income-Flash; Wave-Intel-Badge mit Threat-Icons (Boss/Swarm/Fast/Armor) neben bestehendem SpawnTicker/WavePreview.
- **Buttons/Micro-Interactions:** Hover/Press-States mit sanften Transforms + Success/Fail Feedback; Reduced-Motion beachten.
- **Typography/Icon Pass:** Konsistente UI-Font-Hierarchie, Stat-Icons für Range/Splash/Slow/Chain/Crit/DoT im Radial/Panel verwenden.

## Upgrade/Perk Assets (Icons & Frames)
- **Perk/Branch-Icons (64px, PNG/SVG tintbar):**
  - Indica: Rupture, Penetrator
  - Sativa: Shrapnel, Focus
  - Support: Cryo, Toxin
  - Sniper: Pierce, Weakpoint
  - Flame: Napalm, Pressure
  - Chain: Storm, Arc
- **UI-Rahmen & Buttons:** Panel-Frame, Branch-Linien/Connectoren, Lock/Affordable-States, Hover/Active-Glow.
- **Tier-Badges & Stat-Icons:** L1/L2/L3 Badges; Icons für Range/Splash/Slow/Chain/Crit/DoT.

## Perk-VFX (Produktion)
- Implementiert: Napalm-Pfütze (Burn-DoT Boden), Shrapnel-Mini-Ring (VFX), Storm-Spark (VFX), Arc-Ring (VFX), Cryo-Ring (VFX), Toxin-Puff (Spread on death), Weakpoint/Execution Marker.
- Offen: Stun/Arc-Schaden/Mark-Bonus als Gameplay-Effekt; Branch-Cosmetics (Overlay) für bessere Lesbarkeit.

## Neue Assets aus `public/TestAssets` (Einsatzplan)
- **Projektile/VFX (Tower/Perks):**
  - `chain_arc_projectile.png`, `chain_lightning_projectile.png`, `lightning_chain_effect.png`, `storm_effect.png`, `supercharge_effect.png`: Chain-Tower Projektile/Hit-VFX (Storm/Arc).
  - `flamethrower_cone.png`, `napalm_puddle_effect.png`, `fire_trail.png`: Flamethrower Core/Napalm-Spezialeffekt.
  - `shrapnel_effect.png`, `shrapnel_explosion.png`, `sativa_spread_projectile.png`: Sativa Shrapnel Perks.
  - `penetrator_effect.png`, `pierce_effect.png`, `indica_heavy_round.png`, `arrow_impact_spritesheet.png`: Indica/Sniper/Pierce-Perks.
  - `support_slow_projectile.png`, `cryo_freeze_ring.png`, `ice_shard_spritesheet.png`: Support/Cryo Visuals.
  - `poison_trail.png`, `toxin_cloud_effect.png`: Toxin/Virulent Puffs.
  - `fireball_spritesheet.png`, `magic_orb_spritesheet.png`, `css_energy_orb.png`, `css_projectile_basic.png`, `rock_projectile.png`, `leaf_projectile.png`, `shuriken_spritesheet.png`, `ice_shard_spritesheet.png`: generische Projektile/FX für weitere Perks oder neue Tower.
  - `effect_explosion_electric.png`, `effect_explosion_orange.png`, `electric_impact.png`, `freeze_impact.png`, `poison_impact.png`: Hit-Overlays für Schadenstypen/Perks.
  - `weakpoint_marker.png`, `critical_hit_icon.png`, `dot_damage_icon.png`: Anzeige von Mark/Crit/DoT.
- **Spezial-Tiles/Map-Assets:**
  - `gold_well_tile.png`, `rune_tile.png`: Spezialfelder (Income/Range/Stat-Boni).
  - `stone_path.png`, `grass_tile.png`, `swamp_terrain.png`, `texture_grass_cannabis.png`: Tilesets/Biome (Pfad/Gras-Variationen).
  - `tower_range_indicator_*.png`: Range-Ringe pro Tower-Typ.
  - `tower_*_level2_enhanced.png`: alternative L2-Varianten (optionale kosmetische Upgrades).
- **UI/UX:**
  - `ui_upgrade_arrow.png`, `upgrade_path_a.png`, `upgrade_path_b.png`, `upgrade_selected.png`: Upgrade-Radial/Panel-Frames und Connectors.
  - `range_upgrade_icon.png`, `level3_badge.png`, `sniper_scope_upgrade.png`, `focus_effect.png`, `pressure_effect.png`: Stat-/Tier-/Perk-Badges.
- **Enemies/Badges:**
  - `enemy_alien_boss.png`, `enemy_armored_beetle.png`: neue Gegnertyp-Ideen.
  - Badges: `badge_elite.svg.png`, `badge_flying.svg.png`, `badge_regeneration.svg.png`, `badge_stealth.svg.png`, `badge_toxic.svg.png`: zusätzliche Tags.

## Offene Integrationsaufgaben für die neuen Assets
- **Tilesets/Biome:** Pfad/Gras-Texturen (stone_path, grass_tile, swamp_terrain, texture_grass_cannabis) in `TEXTURE_PATHS` mappen; Map-Themes auf konkrete Tilesets schalten statt nur Farbtint.
- **Spezial-Tiles:** `gold_well_tile.png`, `rune_tile.png` als Platzierungsfelder mit Boni (Income/Range/Stat). Placement-Checks + Renderer-Overlay.
- **Upgrade-UI:** `ui_upgrade_arrow`, `upgrade_path_a/b`, `upgrade_selected`, `level3_badge`, `range_upgrade_icon` in Radial/Panel verwenden; Branch-Connectoren und Tier-Badges gestalten.
- **Perk-VFX/Projektile:** oben gelistete Projektile/FX pro Tower-Typ zuordnen (Chain lightning/arc, Sativa shrapnel, Flamethrower cone/napalm, Support cryo/toxin, Sniper/Indica pierce/penetration). Spritesheets (fireball, lightning, ice_shard, shuriken) als Animationsquellen für Projectiles/Particles.
- **Status-Overlays:** `weakpoint_marker`, `critical_hit_icon`, `dot_damage_icon` als HUD/Radial/On-hit Marker (Mark/Crit/DoT).
- **Badges/Enemies:** Neue Gegner-Sprites optional als Elite/Boss einführen; zusätzliche Badge-Tags (flying/stealth/regeneration/toxic/elite) in Renderer und Enemy-Tags verdrahten.
## Projectile & Effects Specs (falls ergänzt werden muss)
- **Palette:** muted bio-organic; primary `#5a8a5a`, cyan `#5a9a9a`, orange `#b87450`, projectile yellow `#fdf1a2`, support cyan `#6be8ff`, danger red `#b85450`.
- **Formate:** PNG mit Alpha; Größen 8–32px (Particles), 32px (Projectiles), 64–128px (Overlays).
- **Assets/Ordner:**
  - `public/projectiles/`: `impact_projectile.png`, `volley_projectile.png`, `support_bolt.png`
  - `public/effects/`: `impact_spark.png`, `splash_indicator.png`, `dot_burn_overlay.png` (+ ggf. toxin/nachladbare Varianten)

## Renderer/Integration Tasks
- Texture-Pfade für neue UI/VFX/Icons ergänzen; Radial-UI Styles finalisieren.
- Per-Branch Overlays optional in `CanvasRenderer` (tint/overlay per branch).

## Balancing/Tests (ToDo)
- Zahlen-Checks für Splash/DoT/Slow/Crit, Streak-Bonus, Bulwark/Carrier HP/Rewards.
- Headless/Autoplay pro Difficulty; Unit-Tests Resist/Slow-Cap/Streak; UI-Tests für Upgrade/Perk-Lock/Affordability.
