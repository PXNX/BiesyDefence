# BiesyDefence AAA UI Redesign Specification

## Executive Summary
Complete redesign of top HUD area to AAA standards: **Prominent MONEY & LIVES** (largest icons/values, top-left glow panel), **WAVE & SCORE** adjacent, secondary infos compact. **Optimized layout** (balanced CSS Grid, no squeezing/stretching). **Compact top-right controls** (shrunk speed chips, icon-only pause). **Modern dark neon theme** (bio-luminescent greens/purples, glows/shadows/transitions). Fully responsive, accessible, performant.

**Key Priorities Met**:
- Money/Lives: 32px icons, 1.5rem bold values, pulsing glow panel.
- Balanced space: Grid areas prevent distortion.
- Creativity: CSS particles, backdrop-blur, cubic-bezier anims, hover ripples.

## Current UI Analysis
From [`GameHUD.tsx`](src/ui/components/GameHUD.tsx:68-82), [`GameControls.tsx`](src/ui/components/GameControls.tsx), [`App.tsx`](src/App.tsx:446-464), [`index.css`](src/index.css:62-66):

- **Layout**: Header `grid-template-columns: 1fr auto auto` → HUD (vertical flex: primaries-glow money/lives stacked, secondary wave/score stacked) **squeezed left**; Controls (buttons wrap, speed hz, audio sliders) **stretched/wrapped right**.
- **Issues**: Inefficient grid (unused 3rd col?), vertical HUD tight on infos, controls sprawl, no prominence hierarchy, basic theme.
- **Elements**: Money/lives (warnings), wave (queued), score, spawn ticker/next-wave-ready, speed (1/2/4x), pause/start/next/reset, audio (mute/sliders).

## New Design: SOTA AAA Top HUD

### Layout Zones & Dimensions
**Fixed Top Bar** (`position: sticky top-0 z-50 h-[80px] md:h-[70px] backdrop-blur-xl`):
```
Desktop (>1200px): grid-template-areas: "primaries secondaries controls" | gap-8 p-4
┌─────────────────┬───────────────┬─────────────────────────────┐
│ PRIMARIES       │ SECONDARIES   │ CONTROLS                    │ ← 80px height
│ (glow panel)    │ (compact row) │ (chips + icons + mini-sldr) │
│ 200px wide      │ 250px wide    │ 300px wide (flex)           │
└─────────────────┴───────────────┴─────────────────────────────┘

Tablet (768-1200px): grid-template-areas: "primaries controls" / "secondaries ." → wrap
Mobile (<768px): flex-col gap-2 → vertical stack
```

- **Primaries Zone** (`grid-area: primaries`): Money + Lives horizontal flex, largest (32px icons, 1.5rem values), bio-gradient glow panel (200x60px).
- **Secondaries Zone** (`grid-area: secondaries`): Wave + Score hz flex (24px icons, 1.1rem values).
- **Controls Zone** (`grid-area: controls justify-self-end`): Compact row – speed chips (20px), pause icon (28px), mini audio slider (80px).
- **Underlay (conditional)**: Next-spawn ticker/progress (full-width bar, 20px h).

**Responsiveness**:
- `@media (max-width: 1200px)`: `grid-template-columns: 1fr 1fr` primaries+secondaries merge.
- `@media (max-width: 768px)`: `flex-direction: column; gap: 1rem;`.
- Canvas: `h-[60vh] md:h-[70vh]`.

### Visual Mockups (ASCII)
**Desktop**:
```
[ 🌿💰 $1,234⚠️ ]  [ 🌊5/20(+3)  🏆12,345 ]  [1x 2x 4x* ⏸️  🔊▰▱ ]
  ↑glow panel         ↑compact row           ↑chips(20px) icon slider(80px)
```

**Mobile**:
```
💰 $1,234⚠️ ❤️20
🌊5/20 🏆12k
1x 2x 4x* ⏸️ 🔊
▰▱▰▱ (spawn progress)
```

**Mermaid Flow** (Component Hierarchy):
```mermaid
graph TD
  App --> TopHUD
  TopHUD --> PrimariesPanel
  TopHUD --> SecondariesRow
  TopHUD --> ControlsGroup
  PrimariesPanel --> MoneyStat[MoneyStat Icon+Value]
  PrimariesPanel --> LivesStat[LivesStat Icon+Value+Glow]
  ControlsGroup --> SpeedChips[SpeedChips 1x|2x|4x]
  ControlsGroup --> PauseBtn[PauseBtn Icon]
  ControlsGroup --> AudioMini[AudioMini Toggle+Slider]
```

### Theme & CSS Vars/Classes (Extend [`theme.ts`](src/assets/theme.ts))
```ts
// src/assets/theme.ts additions
neonGlow: '0 0 25px #39ff14, inset 0 0 15px rgba(57,255,20,0.3)',
bioGradient: 'linear-gradient(135deg, #39ff14aa, #00d4ff80, #ff6b35aa)',
warningGlow: '0 0 20px #ffd93d',
criticalGlow: '0 0 30px #ff6b6b',
panelBg: 'rgba(10,14,10,0.9) backdrop-blur-xl',
```
**Key Classes** (`index.css`):
```css
.top-hud {
  display: grid;
  grid-template-areas: 'primaries secondaries controls';
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
  height: 80px;
  padding: 1rem 2rem;
  background: var(--panelBg);
  border-bottom: 2px solid transparent;
  background-image: radial-gradient(circle, var(--neonGlow));
  box-shadow: var(--neonGlow);
  transition: all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
}
.primaries-panel {
  grid-area: primaries;
  display: flex;
  gap: 2rem;
  background: var(--bioGradient);
  padding: 1rem;
  border-radius: 16px;
  box-shadow: var(--neonGlow);
  animation: glowPulse 2s ease-in-out infinite alternate;
}
@keyframes glowPulse { 0% { box-shadow: var(--neonGlow); } 100% { box-shadow: 0 0 40px #39ff14; } }
.stat-primary { font-size: 1.5rem; font-weight: 700; text-shadow: 0 0 10px currentColor; }
.speed-chip { width: 32px; height: 32px; border-radius: 50%; transition: all 0.2s; }
.speed-chip.active { box-shadow: var(--warningGlow); transform: scale(1.1); }
```

**Hover/Effects**:
- Primaries: Scale 1.05 + intensified glow.
- Chips: Ripple (radial-gradient pulse).
- Transitions: `0.3s cubic-bezier(0.4,0,0.2,1)`.
- Particles: 20x CSS divs (`@keyframes float { ... } position:fixed` bg dots).

### TSX Structure Changes
**New Component**: `TopHUD.tsx` (replaces header children):
```tsx
// src/ui/components/TopHUD.tsx
interface TopHUDProps { snapshot: GameSnapshot; /* controls props */ }
export function TopHUD({ snapshot, onPause, onSpeedChange, ... }: TopHUDProps) {
  return (
    <div className="top-hud">
      <div className="primaries-panel">
        <StatDisplay icon="💰" value={`$${snapshot.money}`} warning={moneyLow} size="large" />
        <StatDisplay icon="❤️" value={snapshot.lives} critical={livesCritical} size="large" />
      </div>
      <div className="secondaries-row">
        <StatDisplay icon="🌊" value={`${snapshot.wave.current}/${snapshot.wave.total}`} />
        <StatDisplay icon="🏆" value={snapshot.score.toLocaleString()} />
      </div>
      <div className="controls-group">
        <SpeedChips speed={snapshot.gameSpeed} onChange={onSpeedChange} />
        <PauseButton isPaused={!snapshot.status === 'running'} onClick={onPause} />
        <AudioMini /* props */ />
      </div>
      {spawnTicker && <SpawnTicker countdown={snapshot.nextSpawnCountdown} />}
    </div>
  );
}
```
- **App.tsx**: `<header><TopHUD {...} /></header>`
- **New Subcomps**: `StatDisplay.tsx` (reusable icon+value+glow), `SpeedChips.tsx` (3 toggles), `PauseButton.tsx` (icon toggle), `AudioMini.tsx` (compact slider), `SpawnTicker.tsx`.
- **Refactor**: Deprecate GameHUD/GameControls → migrate props/logic.

### Asset Needs
1. **Icons (SVG/PNG 64x64 neon glow variants)**: money_coin_neon.png, heart_neon.png, wave_neon.png, score_trophy.png, speed_bolt.png, pause_play.png, audio_speaker.png.
2. **Gradients/Textures**: bio_glow_panel.png (subtle), neon_particle_dot.png (CSS bg).
3. **Hover States**: icon_hover_glow.png variants.
4. **Total**: 10-15 files, `assets/ui/icons/` + `assets/ui/effects/`.

## Responsive & Perf Notes
- **Media Queries**: 5 breakpoints, fluid rem/vh.
- **Perf**: `transform: translateZ(0)` accel, no layout thrashing.
- **A11y**: `aria-label` icons, `role=toolbar`, live regions values.

This spec delivers **engaging professional game UI**: hierarchical, immersive, fluid.
