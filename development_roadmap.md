# Development Roadmap (Current State - Q4 2025)

Economy, UI cleanup, Localization, Audio hooks, Map specials, and tuned Upgrade paths are shipped. Focus shifts to QA depth, new map content, telemetry polish, and mix/UX refinement.

## Done / Landed
- EconomySystem: central queue (rewards, purchases, wave bonuses, interest, life loss), map income modifiers live.
- UI consolidation: deprecated HUD/control files removed; single control surface documented.
- Localization: `t()` wired across HUD/App, language selector live.
- Audio: wave start/complete, kills, placements, achievements wired; AudioMini surfaced.
- Maps: MapManager with special tiles, environmental modifiers, HUD banners; specials feed economy and tower buffs.
- Upgrades/Perks: Stun/Splash/Slow/Crit/DoT tuning plus tag-specific bonuses vs armored/boss/flying/regenerator.
- Testing: deterministic headless harness, telemetry/special-tag checks, unit tests for EconomySystem & upgrade logic.

## Open Focus Areas
1) QA & Perf
   - Expand headless runs (all difficulties), asset/404 checks, perf snapshots.
   - Add E2E coverage for wave transitions and economy regressions.
2) Content & Maps
   - Build planned layouts from `docs/maps_plan.md` (Misty/Terraced/Circular) with optional event overlays.
3) Balance & Telemetry
   - Difficulty tuning using live telemetry; add heatmaps/perf metrics if needed.
4) Audio/UX Polish
   - Music loops/ducking, mix pass; accessibility/tooltips/localization upkeep.

## Risk Notes
- Balance drift when adding new maps/events; guard with telemetry and headless baselines.
- Asset additions (audio/textures) risk 404s without preload checks.

## Next Steps
1. Lock in automated headless/perf runs per difficulty.
2. Ship one new map layout with environmental cue + special-tile placement rules.
3. Add lightweight heatmap/metrics hooks if time permits.
4. Run a mix/localization pass after new strings/assets land. 
