# Upgrade & Assets Master Plan (aktualisiert)

Konsolidierte Infos aus früheren Plänen (ToDo, Balancing_Logic, Assets_Grafics, projectiles_effects_plan). Fokus: Upgrades/Perks, UI/VFX, Assets und Balancing.

## Ist-Stand im Spiel
- **Core-Systems:** Waves/Enemies/Economy/Resists/DoT/Slow/Vulnerability laufen; Streak/Wave-Bonus aktiv. Tower-Profile (Indica/Sativa/Support/Sniper/Flame/Chain) balanciert für L1.
- **Upgrades/Perks:** Daten in `config/upgrades.ts`, Stat-Recompute aktiv; Controller/Logic für Level/Perk-Kauf vorhanden; Radial-UI am Tower existiert (Feintuning nötig).
- **Assets eingebunden:** Tower L1 (Build/Shop), Enemy-Sprites + Badges, Projectiles (impact/volley/support), Effects (impact_spark, splash_indicator, dot_burn_overlay), UI-Basics, Terrain (grass/wood/path). Perk-Icons PNGs liegen in `/public/ui/icons/perks`.

## Offene Arbeit (Priorität)
1) **Upgrade-UI Feinschliff**
   - Radial-Buttons exakt auf Range-Kreis, winkel- und zoomstabil; Hover/Lock/Affordable/Focus-States polieren.
   - Optional: Hotkeys (Core 1/2/3, Branch-A Q/W, Branch-B E/R); kurze Feedback-Glows/Toasts nach Kauf.
2) **Assets für Upgrades/Perks**
   - UI-Frame im KR-Stil (Holz/Metall), Branch-Connectoren, Tier-Badges (L1–L3), Stat-Icons (Range/Splash/Slow/Chain/Crit/DoT).
   - Tower L2/L3-Sprites im Renderer nutzen (Texture-Pfade ergänzen, Level → Sprite-Switch).
   - Branch-Cosmetics (optional Overlay): Sniper-Scope; Support Cryo/Toxin; Chain Coil-Farbe; Flame Nozzle/Napalm-Tank; Sativa Focus/Fragment; Indica Armor-Crack/Explosive Tip.
3) **Perk-VFX (Gameplay-relevant zuerst)**
   - Napalm-Pfütze, Toxin-Spread-Puff, Storm-Stun-Spark, Arc-Splash-Ring, Cryo-Freeze-Ring, Shrapnel-Mini-Explosion, Weakpoint/Execution-Marker.
4) **Balancing & Tests**
   - Feintuning Splash/DoT/Slow/Crit, Streak-Bonus, Bulwark/Carrier HP/Rewards.
   - Autoplay/Headless pro Difficulty (20 Waves); Unit-Checks für Resist/Slow-Cap/Streak; UI-Tests Upgrade-States.
5) **Nice-to-have**
   - Terrain-Variationen (Pfad/Gras), Enemy-Pulse/Stealth/Regenerator Overlays (reiner Polish).

## UI/UX schnelle Gewinne (aus UI_Tasks destilliert)
- **Tower Interaktion & Feedback:** Selection-Glow, Build/Upgrade-Effekt (kurzer Glow/Particle), Projektil-Trails klarer färben; Radial-States (ready/locked/branch-locked) visuell unterscheiden.
- **Resource & Wave Clarity light:** Animierter Money-Tick + kurzer Income-Flash; Wave-Intel-Badge mit Threat-Icons (Boss/Swarm/Fast/Armor) neben bestehendem SpawnTicker/WavePreview.
- **Buttons/Micro-Interactions:** Hover/Press-States mit sanften Transforms + Success/Fail Feedback; Reduzierte Motion-Option respektieren (keine übertriebenen Shakes).
- **Typography/Icon Pass:** Konsistente UI-Font-Hierarchie, stat-Icons für Range/Splash/Slow/Chain/Crit/DoT im Upgrade-Radial/Panel verwenden.

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
- Napalm-Pfütze (Burn-DoT Boden), Shrapnel-Mini-AoE, Storm-Stun-Spark, Arc-Mini-Ring, Cryo-Freeze-Ring, Toxin-Puff (Spread on death), Weakpoint/Execution Marker.
- Optional Branch-Cosmetics (Overlay je Tower, siehe oben) für bessere Lesbarkeit der Spezialisierung.

## Projectile & Effects Specs (falls ergänzt werden muss)
- **Palette:** muted bio-organic; primary `#5a8a5a`, cyan `#5a9a9a`, orange `#b87450`, projectile yellow `#fdf1a2`, support cyan `#6be8ff`, danger red `#b85450`.
- **Formate:** PNG mit Alpha; Größen 8–32px (Particles), 32px (Projectiles), 64–128px (Overlays).
- **Assets/Ordner:**
  - `public/projectiles/`: `impact_projectile.png`, `volley_projectile.png`, `support_bolt.png`
  - `public/effects/`: `impact_spark.png`, `splash_indicator.png`, `dot_burn_overlay.png` (+ ggf. toxin/nachladbare Varianten)

## Renderer/Integration Tasks
- Texture-Pfade für Tower L2/L3 und neue VFX/Icons ergänzen; Radial-UI Styles finalisieren.
- Per-Branch Overlays optional in `CanvasRenderer` (tint/overlay per branch).

## Balancing/Tests (ToDo)
- Zahlen-Checks für Splash/DoT/Slow/Crit, Streak-Bonus, Bulwark/Carrier HP/Rewards.
- Headless/Autoplay pro Difficulty; Unit-Tests Resist/Slow-Cap/Streak; UI-Tests für Upgrade/Perk-Lock/Affordability.
