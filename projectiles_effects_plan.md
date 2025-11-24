# Projectiles & Effects Planung

## Projekt-Context
**Tower Defense Game - Bio-Organic Theme**
- **Farbpalette**: Muted Colors mit dezenten Glows
- **Primary Colors**: `#5a8a5a` (subtle green), `#5a9a9a` (subtle cyan), `#b87450` (muted orange)
- **Projectile Color**: `#fdf1a2` (bright yellowish)
- **Support Color**: `#6be8ff` (cyan)
- **Danger Color**: `#b85450` (muted red)

## Benötigte Assets (aus Assets_Grafics.md)

### 1. Impact Projectile (32px)
**Beschreibung**: Small bullet sprite + Muzzle flash (PNG 32px), Impact spark particles (tiny PNG or procedural)
**Prompt-Planung**:
- Small bullet sprite, 32px, bio-organic design
- Projectile color: `#fdf1a2` mit subtilem glow
- Muzzle flash effect am hinteren Teil
- Clean, readable silhouette für gameplay
- PNG mit transparency

### 2. Impact Spark Particles
**Beschreibung**: Tiny PNG particles für Treffer-Effekte
**Prompt-Planung**:
- Kleine spark particles (8-16px)
- Bright yellow/white sparks mit subtilem orange glow
- Multiple variations für particle diversity
- Semi-transparent für layering effects
- Bio-organic particle design

### 3. Volley Projectile
**Beschreibung**: Dual-shot pellets/bolts (small bright yellow/white), light trail
**Prompt-Planung**:
- Dual projectile design (zwei pellets nebeneinander)
- Bright yellow/white colors: `#fdf1a2`
- Light trail effect hinter den projectiles
- Small, fast appearance für volley tower
- Clean silhouette für gameplay clarity

### 4. Support Bolt
**Beschreibung**: Energy orb/beam (cyan), slow ring pulse
**Prompt-Planung**:
- Energy orb/beam design
- Cyan color: `#6be8ff` mit `#5a9a9a` accents
- Slow ring pulse effect um das orb
- Bio-organic energy design
- Semi-transparent für layering

### 5. DoT Effect (Damage over Time)
**Beschreibung**: Subtle burn/toxin overlay (orange/green). Low-res PNG or procedural gradient
**Prompt-Planung**:
- Overlay effect für DoT (burn/toxin)
- Orange/green gradient: `#b87450` zu `#5a8a5a`
- Semi-transparent overlay für enemy application
- Low-res design für performance
- Bio-organic texture pattern

### 6. Splash Indicator
**Beschreibung**: Radial ripple ring (semi-transparent PNG) for hits
**Prompt-Planung**:
- Radial ripple ring effect
- Semi-transparent PNG für hit indicators
- Multiple ring variations (small, medium, large)
- Subtle cyan/green colors: `#5a9a9a`
- Clean ring design für visibility

## Ordnerstruktur
```
BiesyDefence/public/
├── effects/
│   ├── impact_spark.png
│   ├── dot_burn_overlay.png
│   ├── dot_toxin_overlay.png
│   └── splash_indicator.png
└── projectiles/
    ├── impact_projectile.png
    ├── volley_projectile.png
    └── support_bolt.png
```

## Technische Spezifikationen
- **Format**: PNG mit transparency
- **Größen**: 8-32px (particles), 32px (projectiles), 64-128px (effects)
- **Style**: Bio-organic mit dezenten colors
- **Performance**: Optimiert für Canvas rendering
- **Naming**: Konsistente, descriptive Namen

## Game Integration
- Assets werden in `public/` directory gespeichert
- Canvas-Renderer kann direkt auf PNGs zugreifen
- Semi-transparente overlays für effect layering
- Particle system kann variations nutzen