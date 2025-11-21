# Assets & Graphics TODOs

## Enemy-Silhouetten & Tags
- **Fast (runner/swift)**: PNG oder SVG Badge/Icon (cyan/teal), Motion-trail Overlay für Canvas (8–12px Strich, leichte Blur). Kleines Schild-Overlay für „swift_runner“ optional.
- **Armored/Bulwark**: PNG mit sichtbarer Panzerung/Platten, Schild-Icon (hellgrau/silber). Optional: separate Shield-Bar Sprite oder SVG Overlay.
- **Boss (carrier)**: Größeres Sprite (mind. 128px) mit Kern + leichten Glüheffekten (orange), On-Death Spawn-Hinweis (Risse/Spalt). Badge-Farbe: #f97316.
- **Swarm**: Kleine sprites (2–3 Varianten) in giftgrün (#a3e635), leicht flache Form, hohe Kontrastkanten.
- **Generic badges** (Canvas Overlay): Kreis-Icons für Tags (fast/armored/boss/shielded/swarm) als kleine SVGs (single-color + white stroke) für beide Renderer.

## Tower-Stufen (Level 1–3)
- **Indica**: Drei PNGs (64–96px) mit zunehmender Panzer-/Rohrgröße, Impact-Styling in Grün/Teal; Level 3 mit leichten Funken- oder Mündungsflash-Details.
- **Sativa**: Drei PNGs (64–96px) mit schlanker, schneller Silhouette, gelbe Akzente; Level 3 mit Doppel-/Triple-Mündungen und kleinem Energieeffekt.
- **Support**: Drei PNGs (64–96px) mit Kontroll-/Energieoptik, Blau/Cyan; Level 3 mit „Anchor/Net“-Akzent oder Pulsring.
- **Range/Slow/Splash UI**: Kleine SVG-Icons, die Range/Splash/Slow im HUD/Tower-Panel visualisieren (Kreis, Wellenlinien, Schildbruch).

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
