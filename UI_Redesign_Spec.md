# UI Redesign Specification: AAA Tower Defense Interface

## Overview

### Design Philosophy
Achieve State-of-the-Art (SOTA) AAA quality for a bio-luminescent cannabis-themed tower defense game. Focus on immersion through:
- **Minimalist HUD**: Icon-driven, compact stats with subtle animations.
- **Neon Bio-Glow Theme**: Pulsing greens, purples, bioluminescent effects fitting cannabis cultivation defense.
- **Seamless Integration**: Merge HUD/Controls into unified top bar; polish sidebar.
- **Modern CSS Techniques**: Grid/Flex, CSS vars, gradients, custom properties, backdrop filters, CSS-only particles (where possible).
- **Responsiveness**: Fluid from desktop to mobile, touch-optimized (44px+ targets).
- **Accessibility**: ARIA, high contrast, reduced motion, keyboard nav.
- **Performance**: 60FPS target, throttled updates, hardware accel.

### Key Removals
- \"Cannabis Cultivation Defense\" (eyebrow).
- \"Phased Bio-Defense\" (h1).
- \"Alpha prototype - Phase 1+2 build\" (subtitle).
- \"Wave State:\" indicator and phase value.

### Retained/Beautified Elements
- Stats: Money ($), Lives (❤️, critical ≤3, warning ≤10), Score (🏆), Wave (🌊 current/total + queued), Speed (⚡ Nx), FPS (<30 warning).
- Status Pill: PLAYING/PAUSED/READY/VICTORY/DEFEATED (enhanced visuals).
- Next Wave indicator/progress bar/ticker.
- Controls: Start/Resume, Pause, Next Wave, Reset, Speed (1x/2x/4x), Mute + sliders.

### High-Level Changes
- **Header**: Simplified fixed top bar (icon-bar layout).
- **Overall**: Canvas-dominant, sidebar collapsible/polished.
- **Theme**: Expand [`theme.ts`](src/assets/theme.ts) with neon palette.
- **Effects**: Glows, pulses, particles (CSS for UI, canvas for game).

## Layout Wireframes

### Desktop (1400px+)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (fixed, grid: stats | pill | controls)                                               │
│ [💰$xxx ❤️xx(⚠️) 🏆xx,xxx]  [🎮 PLAYING]  [▶️ ▶️ ⏭️ 🔄 2x 🔊 sliders]                      │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Sidebar (320px)                  │ Canvas (70vh, responsive)                                  │
│ ┌─────────────┐                  │                                                        │
│ │ TowerPicker │                  │  [Game Canvas with overlays]                               │
│ │ (cards+prev)│                  │                                                        │
│ └─────────────┘                  │                                                        │
│ ┌─────────────┘                  │                                                        │
│ │ Debug      │                  │                                                        │
│ │ (prod hide)│                  │                                                        │
│ └─────────────┘                  │                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet (768-1200px)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (flex wrap: stats+controls centered)                                                  │
│ [💰 ❤️ 🏆 🌊 ⚡ FPS]  [🎮 PLAYING]  [▶️ ▶️ ⏭️ 🔄 2x 🔊]                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Canvas (full width, 60vh)                                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Sidebar (full width, stacked: TowerPicker | Debug)                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (column: stats | pill/controls stacked)                                               │
│ [💰 ❤️ 🏆 🌊 ⚡ FPS]                                                                         │
│ [🎮 PLAYING] [▶️ ▶️ ⏭️ 🔄 | 2x | 🔊 sliders]                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Canvas (95vw, 50vh)                                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ TowerPicker (compact cards)                                                                 │
│ Debug (hidden)                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Specs

### Top Bar (New: Merge GameHUD + GameControls)
- **Layout**: CSS Grid (1fr auto 1fr), fixed top, backdrop-blur, neon border glow.
- **Left: Stats Bar** (horizontal flex icons+values, pulse on change):
  - Icons (24px, glow): 💰 Money, ❤️ Lives (color: green/yellow/red), 🏆 Score, 🌊 Wave (current/total, queued badge), ⚡ Speed, 📊 FPS (warning glow).
- **Center: Status Pill** (large, animated emoji+text, gradient bg, pulse/shrink).
- **Right: Controls** (compact flex):
  - Primary: ▶️ Start/Resume (glow pulse if ready), ⏸️ Pause, ⏭️ Next Wave (ready: glow), 🔄 Reset.
  - Speed: Toggle chips (1x/2x/4x, active glow).
  - Audio: 🔊 Mute toggle, mini-sliders (compact, thumb glow).
- **Next Wave/Spawn**: Inline progress under stats, ticker anim (marquee if long).
- Props: Same as current, plus new anim triggers.

### Sidebar: TowerPicker (Enhanced)
- Vertical stack: Header (\"Deploy Towers\"), Grid cards (3 cols desktop, 1 mobile).
- Cards: Larger (preview canvas?), stats grid, upgrade path preview, affordability glow/warn.
- Feedback: Toast below (slide-in).
- Collapsible on mobile.

### DebugPanel
- Prod: Hidden via CSS (`:not(.dev) { display: none; }`).
- Polish: Accordion, sliders with thumbs.

### Overlays (Start/GameOver/Victory)
- Enhanced: Larger cards, confetti particles (CSS), stats recap, share button.

### Canvas Wrapper
- Responsive height (min 45vh, max 70vh).
- Border glow, vignette effect.

## Style Guide

### Colors (Extend [`theme.ts`](src/assets/theme.ts))
```ts
export const palette = {
  // Core Bio-Neon
  bgPrimary: '#010409',
  bgSecondary: 'rgba(3, 19, 6, 0.8)',
  accentNeonGreen: '#7DF5A3',
  accentBioPurple: '#C3B1F4',
  accentGlow: '#A8FF7F',
  dangerRed: '#FF6B6B',
  warningOrange: '#FFD93D',
  successEmerald: '#6FF98E',
  textPrimary: '#F7F2E7',
  textSecondary: '#B9CFB1',
  // Glows/Gradients
  glowGreen: '0 0 20px #7DF5A3',
  gradientBio: 'linear-gradient(135deg, #7DF5A3, #C3B1F4)',
  shadowNeon: '0 0 30px rgba(125, 245, 163, 0.5)',
};
```

### Fonts
- **Primary**: Space Grotesk (400/500/600/700).
- Sizes: Top bar labels 0.8rem (upper), values 1.1rem bold.
- Mobile: Scale 0.75-1rem.

### Effects & Animations
- **Glows**: `box-shadow: var(--glow-green);` on hover/active.
- **Pulses**: `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }` for warnings.
- **Particles (CSS)**: Multiple divs with `position:fixed`, anim translate/rotate/scale/fade.
- **Transitions**: `all 0.3s cubic-bezier(0.4,0,0.2,1)`.
- **Gradients**: Radial bg for top bar, linear for pills/progress.
- **Backdrop**: `backdrop-filter: blur(20px) saturate(180%)`.

### Spacing/Sizing
- Top bar: ph 2rem, h 80px (mobile 70px).
- Icons: 24px (mobile 20px).
- Buttons: min 44px touch, pad 0.75rem 1.5rem.
- Borders: 1-2px neon glow.

## Implementation Notes

### File Changes
- **`App.tsx`**: Remove titles div, new `<TopBar />` wrapper for HUD+Controls. Conditional Debug (`import.meta.env.DEV`). Update grid to `grid-template-columns: 1fr; grid-template-rows: auto 1fr auto;`.
- **`index.css`**: New `.top-bar`, `.stats-bar`, `.status-pill-enhanced`, etc. Responsive media queries. CSS particles for bg.
- **`theme.ts`**: Expand palette as above.
- **New Components**: `TopBar.tsx` (merge HUD/Controls), `StatsIcon.tsx` (reusable).
- **Update Components**: `GameHUD.tsx` → `StatsBar.tsx`, `GameControls.tsx` → `ControlBar.tsx`.

### Accessibility/Perf Best Practices
- **AARIA**: `role=toolbar` top bar, `aria-live=polite` stats, `aria-pressed` toggles.
- **Reduced Motion**: `@media (prefers-reduced-motion)` disable anims.
- **High Contrast**: `@media (prefers-contrast: high)` thicker borders.
- **Perf**: `will-change: transform;` glows, RAF throttled updates, `contain: layout style paint;`.
- **Keyboard**: Focus styles glow, trap in overlays.

### New Assets Needed (Suggest)
- Icons (32x32 PNG/SVG): Enhanced money/lives/score/wave/speed/fps/audio (neon glow variants).
- Bg Textures: Subtle cannabis leaf pattern for top bar/canvas vignette.
- Particles: Tiny PNGs for CSS (glow dots, leaves).
- No code gen; external artist.

### Migration Steps
1. Backup current UI.
2. Implement new top bar skeleton.
3. Migrate stats/controls data.
4. Style/theme iter.
5. Test responsive/perf.
6. Accessibility audit.

This spec transforms prototype UI to immersive AAA experience.
## Top Bar UI Refinement v2.0 (Post-User Feedback)

### Feedback Integration Summary
- ✅ **Removed Status Pill**: Completely eliminated center status pill/icon/text for decluttering.
- ✅ **Space Optimization**: Redesigned grid for balanced distribution - no more cramped left or spacious right.
- ✅ **Priority Reordering**: 
  - **Primary**: Money & Lives (prominent duo, large/glow-grouped).
  - **Secondary**: Wave & Score (medium row).
  - **Tertiary**: Speed, FPS, Audio Mute (compact icons).
  - **Controls**: Action buttons (right-aligned).

### New Layout Structure
**CSS Grid**: `grid-template-columns: 1fr auto 1fr auto` (responsive: stack on mobile/tablet).
- **Primaries**: Glow panel (bio-gradient bg, pulsing border).
- **Enhanced Visuals**: Larger primaries (32px icons, 1.5rem text), subtle anims (number tween, scale-pulse), neon glows.
- **Responsiveness**: Fluid scaling, touch-optimized (44px+).

### ASCII Wireframes

**Desktop (1400px+)**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (fixed, neon glow, backdrop-blur)                               │
│ ┌──────────────┐ ┌─────────────┐ ┌──────┐ ┌──────────────┐             │
│ │ 💰 $1,234    │ │ 🌊 5/15     │ │⚡2x   │ │ ▶️ ⏸️ ⏭️ 🔄 │             │
│ │ ❤️ 20        │ │ 🏆 12,345   │ │FPS:60│ │ sliders 🔊  │             │
│ └─glow panel──┘ └───────┘ └🔇──┘ └──────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```
- Left: Large glow panel (Money/Lives stacked).
- Center-L: Wave/Score horizontal.
- Center-R: Compact Speed/FPS/Mute icons.
- Right: Controls (btns + mini-sliders).

**Tablet (768px+)**:
```
┌─────────────────────────────────────┐
│ [💰$ ❤️20] [🌊 🏆] [⚡ FPS 🔊] [▶️⏸️⏭️🔄] │
└─────────────────────────────────────┘
```

**Mobile (<768px)**:
```
┌─────────────────────────────┐
│ 💰 $1,234 ❤️20              │
│ 🌊5/15 🏆12k ⚡2x FPS:60 🔊  │
│ ▶️ ⏸️ ⏭️ 🔄 [sliders]       │
└─────────────────────────────┘
```

### Detailed Enhancements
- **Glow Panel (Primaries)**: `backdrop-filter: blur(12px); background: radial-gradient(bio-neon); box-shadow: 0 0 30px var(--accent-glow); border-radius: 16px;`.
- **Icons**: [`assets/ui/icons/money_icon.png`](assets/ui/icons/money_icon.png), etc. (32px primary, 24px secondary, filter: drop-shadow neon).
- **Typography**: Primaries `font-size: 1.5rem font-weight: 700`, secondary `1.1rem 600`.
- **Animations** (CSS keyframes):
  - Update pulse: `transform: scale(1.05); opacity: pulse;`.
  - Number change: Smooth counter via JS/CSS.
  - Hover: Intensified glow `box-shadow: 0 0 40px`.
- **Next Wave/Spawn**: Compact inline under Wave (ticker bar).
- **Theme Integration**: Extend [`theme.ts`](src/assets/theme.ts) with `--glow-primary`, `--panel-gradient`.

### Implementation Notes (Updated)
- **GameHUD.tsx**: New group structure, remove status pill, integrate icons.
- **TopBar.tsx** (merged HUD+Controls): New grid layout.
- **index.css**: `.topbar-v2 { display: grid; gap: 2rem; } .primaries-glow { ... }`.
- **Accessibility**: `aria-live="polite"` on changing values, high-contrast modes.
- **Perf**: CSS-only anims, `contain: layout paint;`.

This refinement achieves AAA polish: prominent primaries, balanced space, immersive neon effects.