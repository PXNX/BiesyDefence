# BiesyDefence

Cannabis-themed tower defense built as a browser prototype that stages the first playable loop of a single map (Phase 1–5). React renders the UI, a lean Canvas 2D renderer draws the map, and a fixed-step `GameController` keeps the simulation consistent across platforms.

## Alpha Focus (Phase 1–5)
1. **Tech Foundation (Phase 1)** – Vite + React + TypeScript + Canvas; hot reload, build, and GitHub Pages ready.
2. **Core Architecture (Phase 2)** – `GameState`, modular systems (enemies/towers/projectiles), and a deterministic tick loop inside `GameController`.
3. **Map & Path (Phase 3)** – Tile grid, guided path nodes, and highlight/preview helpers for placement.
4. **Enemy Baseline (Phase 4)** – `Pest` and `Runner` units that follow waypoints, reduce lives, and report death/reward.
5. **Tower Base System (Phase 5)** – Indica/Sativa/Support towers with grid placement, targeting, projectile spawning, and slow support.
6. **Projectiles & Combat (Phase 6)** – Visible projectiles trace each shot, homing toward targets, and track hits so damage is resolved with health bars.
7. **Wave + Economy Loop (Phase 7)** – Controlled wave triggering, Next Wave UI, money/lives updates, and win/loss detection as the game loop completes.
8. **UI + Menus (Phase 8)** – Start screen with play/how-to instructions, dynamic HUD (spawn ticker + statuses), Next Wave plus overlay guides, and game-over Retry.
9. **Graphics & Effects (Phase 9)** – Stylized tower sprites, gradient terrain, particle-based muzzle flashes/impacts, and responsive canvas scaling for a modern tabletop aesthetic.
10. **Balance & Performance (Phase 10)** – Adjusted tower/fire stats, projectile pooling, quick-wave jumping, debug toggles (ranges/hitboxes), and FPS instrumentation so the alpha feels tuned yet observable.

## Tech Stack

- **Language**: TypeScript (strict mode).
- **UI + State Management**: React + Vite (via `@vitejs/plugin-react`).
- **Rendering**: Custom Canvas 2D renderer (`src/game/rendering/CanvasRenderer.ts`) for map, enemies, towers, projectiles, highlights, and ranges.
- **Systems**: Stateless systems (`EnemySystem`, `TowerSystem`, `ProjectileSystem`, `WaveSystem`, `EconomySystem`) orchestrate the simulation each fixed tick.
- **Bundler**: Vite (ES module output + legacy support).
- **Quality**: ESLint + Prettier.

## Project Layout

```
src/
├── assets/               # Theme palettes, fonts, shared art constants
├── game/
│   ├── config/           # Constants, wave schedules, balancing
│   ├── core/             # GameController, GameStateFactory, shared types
│   ├── entities/         # Enemy and future entity factories
│   ├── rendering/         # CanvasRenderer (+ highlight interfaces)
│   ├── systems/          # Enemy/Tower/Projectile/Wave/Economy systems
│   └── utils/            # Math helpers, ID generator
├── ui/
│   └── components/       # React HUD, controls, tower picker
├── App.tsx               # Shell that connects React and GameController
├── main.tsx              # React entrypoint
└── index.css             # Global visual system
```

## Running the Prototype

```bash
# Install deps (runs in the sandbox)
../setup_env.bat npm install

# Start dev server (http://localhost:5173)
../setup_env.bat npm run dev

# Build for production
../setup_env.bat npm run build
```

## Development Notes

- `GameController` (src/game/core/GameController.ts) owns the fixed-step loop, camera sizing, UI subscriptions, hover states, tower placement validation, and the react canvas bridge.
- Canvas rendering is centralized in `CanvasRenderer`; it draws tiles, the guided path, highlight previews/ranges, towers, projectiles, and enemy hit indicators (including a ring when slowed by support towers).
- UI components (`GameHUD`, `GameControls`, `TowerPicker`) subscribe to `GameController` snapshots for resources, waves, and status.
- Hovering the canvas calls `GameController.updateHover`, which computes tile validity, range previews, and triggers re-rendering without disturbing the fixed tick.
- The wave system uses `WAVE_SCHEDULES` with spawn delays, enemies drop money via `EconomySystem`, and support towers slow units inside their range before they reach the goal.

## Browser Support

- Modern evergreen browsers are supported via the built-in Vite dev server plus `@vitejs/plugin-legacy` for older browsers.
