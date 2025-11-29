# ToDo Tasks

## 1. Economy & Balancing (critical)
- [x] Expand the stub at `src/game/systems/EconomySystem.ts` into the canonical money manager the roadmap demands. `GameController` now queues economy events (kills, purchases, wave bonuses, interest, life loss) and applies them centrally, updating peaks/notifications from one place.
  - Follow-up: add modifiers for map specials (gold wells/runes) and telemetry hooks for the new event reasons when those systems ship.

## 2. UI consolidation & cleanup
- [x] Remove the deprecated backups that the roadmap calls out (`src/ui/components/GameControls.tsx.bak:6`, `src/ui/components/GameHUD.tsx.bak:3`, `src/ui/components/TopHUD.tsx.deprecated:7`, `src/ui/components/TowerPicker.tsx.deprecated:21`) and lock the visible controls (`GameControlPanel` at `src/ui/components/GameControlPanel.tsx:33`, `App.tsx:640`, `TowerIconBar` at `src/App.tsx:650`) behind a single, documented surface. `development_roadmap.md:23` highlights this clean-up as priority.
  - Replace any lingering imports that target `.bak`/`.deprecated` files and ensure the currently used components cover the same behaviors (pause, speed chips, tower selection, audio toggle).
  - Reintroduce `AudioMini` (`src/ui/components/AudioMini.tsx:1`) only through the active HUD, because it is currently referenced solely in `TopHUD.tsx.deprecated:43`.

## 3. Localization rollout
- [x] Wire `TranslationService.ts:354` into the main UI instead of leaving it unused outside the demo (`src/demo/Chapter6IntegrationDemo.ts:8`). Static strings such as the start overlay titles/buttons in `App.tsx:721`, `:732`, `:737` and control labels in `GameControlPanel.tsx:33`, `:46` must flow through `t()` so we can ship multiple languages as planned.
  - Add a language selector tied to `LanguageDetector` and the strings bundle to satisfy `development_roadmap.md:39` and bring the roadmap’s localization section online.
  - Sweep every visible component for hard-coded English (`App`, HUDs, tooltips) and centralize them in `strings.ts` so the same translations can reach React and telemetry messages.

## 4. Audio & feedback integration
- [x] Deepen the `AudioManager` hooks (`src/game/audio/AudioManager.ts:260`) beyond the existing tower-upgrade triggers in `App.tsx:120`, `:352`, `:365`, `:381`, `:395`. Roadmap `development_roadmap.md:39` calls for integrating sound across waves, hits, and UI.
  - Emit sounds for wave start/complete, enemy deaths, tower placements, and achievements from the controller instead of only on UI button callbacks.
  - Surface audio settings from `AudioMini` (`src/ui/components/AudioMini.tsx:1`) through whichever panel replaces the deprecated `TopHUD.tsx.deprecated:43` so players can mute/unmute without stumbling over unused code.

## 5. Map special tiles & events
- [x] Give `specialTiles` real gameplay effects: Gold wells add income, runes boost tower range/damage; renderer shows capture rings; Map metadata carries HUD banners/environmental mods.
  - Captures apply income buffs and tower stat boosts; bonuses surface in HUD (`StatsCornerLayout`) and map metadata (`src/game/core/types.ts`).
  - Map system now supports environmental modifiers, event banners, and feeds renderer/economy.

## 6. Upgrade/perk tuning & enemy interplay
- [x] Revisited `TOWER_UPGRADES` with tuned costs/effects and tag-specific bonuses (Stun/Splash/Slow/Crit/DoT) aligned to enemy tags (`armored_beetle`, `alien_boss`).
  - Perks validated against resistances/behaviors; tag bonuses documented in `docs/perk_tag_synergies.md`.

## 7. Testing & QA expansion
- [x] Added focused tests beyond the determinism check: EconomySystem + upgrade/affordability unit tests, harness assertions for specials/enemy tags/telemetry across difficulties.
  - Headless harness extended; new unit tests cover core economy and perk locking.

## 8. Documentation sync
- [x] Roadmap/docs refreshed to reflect current implementation (MapManager/Audio/Upgrades live) and list remaining gaps (QA/perf runs, new maps, optional audio polish).
