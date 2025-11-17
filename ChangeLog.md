# ChangeLog

## Phase 1 – Foundation
- Vite + React + TypeScript entry with Canvas renderer.
- Basic folder hierarchy and theme palette for the cannabis aesthetic.

## Phase 2 – Core Architecture
- Central `GameState`, systems (`Enemy`, `Tower`, `Projectile`, `Wave`, `Economy`), `GameController`, and fixed-step loop.
- Snapshot subscription for UI and HUD communication.

## Phase 3 – Map & Path
- Grid + path generation, highlight helpers, path nodes, and fancy background grid.
- Tile connectivity ensures enemies follow the Bloons-style path.

## Phase 4 – Enemy System
- Enemy movement along path with support slow effects, health bars, and reach/goal detection.
- Particle slows + health indicator.

## Phase 5 – Tower System
- Indica/Sativa/Support tower set with targeting, range, cooldowns, and UI placement validation.
- React HUD + controls plus tower picker UI to place towers on grass tiles.

## Phase 6 – Projectiles
- Projectile trails, projectile speed/damage handling, impact detection, and particles.
- Particle pooling hints introduced later.

## Phase 7 – Wave + Economy
- Finite wave loop, manual next-wave buttons, economy rewards, loss/win detection, and HUD ticker.

## Phase 8 – UI & Overlays
- Start screen, how-to tips, game over overlay, retry, and spawn ticker + statuses.
- Debug overlays added in Phase 10 but built atop this UI.

## Phase 9 – Graphics & Effects
- Gradient terrain, stylized towers, muzzle/impact particles, and responsive canvas scaling.

## Phase 10 – Balance & Alpha polish
- Rebalanced tower stats, projectile pooling, debug panel with range/hitbox toggles, FPS instrumentation, and quick wave jumping.
***
> Built for Alpha-level polish; next steps focus on content and further tuning.
