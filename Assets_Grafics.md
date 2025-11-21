# Assets & Graphics TODOs

## Enemy-Silhouetten & Tags
- **Fast (runner/swift)**: PNG oder SVG Badge/Icon (cyan/teal), Motion-trail Overlay für Canvas (8–12px Strich, leichte Blur). Kleines Schild-Overlay für „swift_runner“ optional.
- **Armored/Bulwark**: PNG mit sichtbarer Panzerung/Platten, Schild-Icon (hellgrau/silber). Optional: separate Shield-Bar Sprite oder SVG Overlay.
- **Boss (carrier)**: Größeres Sprite (mind. 128px) mit Kern + leichten Glüheffekten (orange), On-Death Spawn-Hinweis (Risse/Spalt). Badge-Farbe: #f97316.
- **Swarm**: Kleine sprites (2–3 Varianten) in giftgrün (#a3e635), leicht flache Form, hohe Kontrastkanten.
- **Generic badges** (Canvas Overlay): Kreis-Icons für Tags (fast/armored/boss/shielded/swarm) als kleine SVGs (single-color + white stroke) für beide Renderer.

## Tower-Stufen & UI (Level 1-3, jeweils **PNG 64-128px**)
- **Indica**: 3 Stufen. Schwerer Kanonenstil in Grün/Teal, L1 schlicht, L2 mit stärkerem Rohr/Seitenpanzerung, L3 mit Mündungsflash/Sparks. Asset-Namen: `tower_indica_level1/2/3.png`.
- **Sativa**: 3 Stufen. Schlanke Silhouette, gelbe Akzente, "schnell" lesbar. L3 mit Doppel-/Triple-Barrel + kleiner Energie-Glow. `tower_sativa_level1/2/3.png`.
- **Support**: 3 Stufen. Energie-/Kontrolloptik, Blau/Cyan. L3 mit sichtbarem Pulsring/Anchor-Net-Akzent. `tower_support_level1/2/3.png`.
- **Sniper**: 3 Stufen. Extrem langes Rohr/Visier, sand-beige/gelb Highlights, high-tech Bipod/Tripod. L3 mit Laser-Glare/Fernziel-Optik. `tower_sniper_level1/2/3.png`.
- **Flamethrower**: 3 Stufen. Breiter Tank + Düse, orange Glut. L3 mit Doppeltank oder Hitze-Schimmer/Flammenstreifen. `tower_flamethrower_level1/2/3.png`.
- **Chain (Lightning)**: 3 Stufen. Spulen/Coils, blau-violetter Blitz. L3 mit Arc-Halo/mini Tesla-Krone. `tower_chain_level1/2/3.png`.
- **Upgrade-Badge**: Kleine SVGs `upgrade_l1.svg`, `upgrade_l2.svg`, `upgrade_l3.svg` (Farbverlauf hell -> kräftig) für HUD/Tooltip.
- **Tower-Stat-Icons** (SVG): `icon_range.svg` (Zielkreis), `icon_splash.svg` (Radialwelle), `icon_slow.svg` (Eis-/Schneeflocke), `icon_pierce.svg` (Pfeil durch Block), `icon_dot.svg` (Flamme/Tropfen), `icon_control.svg` (Stopp/Netz).

## Projectiles & Effects
- **Impact projectile**: Small bullet sprite + Muzzle flash (PNG 32px), Impact spark particles (tiny PNG or procedural).
- **Volley projectile**: Dual-shot pellets/bolts (small bright yellow/white), light trail.
- **Support bolt**: Energy orb/beam (cyan), slow ring pulse.
- **DoT effect**: Subtle burn/toxin overlay (orange/green). Low-res PNG or procedural gradient.
- **Splash indicator**: Radial ripple ring (semi-transparent PNG) for hits.

## UI / HUD Assets
- **Upgrade badge**: Small SVG badge to indicate tower level in HUD (L1/L2/L3), with color steps.
- **Upgrade button icon**: Minimal upward arrow SVG for Control Panel, matching gradient (#2dd4bf → #0ea5e9).
- **Wave bounty icon**: Coin/crest SVG for no-leak bonus indicator.
- **Tag legend**: Small icons (fast/armored/boss/shielded/swarm) for HUD legend tooltip.

## Map / Terrain
- **Path texture**: Optional dedicated path PNG (currently wood_base reused). Create dirt/stone strip (48px tile) with subtle variation + seamless pattern.
- **Grass variation**: 2–3 subtle grass overlays to break repetition (48px tile).

## Animation-Ideen (optional)
- **Enemy badges**: Simple CSS/SVG pulse for boss badge, light flicker for shielded.
- **Projectiles**: CSS/Canvas trail animation for fast shots (runner counterplay).
- **Support slow ring**: Animated expanding ring (Canvas) on hit; small cyan glow decal as PNG fallback.

## Format-Empfehlungen
- **Sprites**: PNG (power-of-two where possible, 64/96/128px). Keep alpha, mild dithering.
- **Badges/Icons**: SVG (single-color + stroke) for easy tinting.
- **Particles/Overlays**: Tiny PNG (8–32px) or procedural Canvas where noted.

## Platzierung im Projekt
- Assets unter `public/towers/` (Levels), `public/enemies/`, `public/effects/`, `public/ui/icons/`.
- Renderer nutzt PNGs; Icons/Badges können als SVG eingebunden und im Canvas gerastert oder als UI-Overlay genutzt werden.
