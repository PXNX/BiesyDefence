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
