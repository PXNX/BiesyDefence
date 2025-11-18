# Known Bugs and Issues for Tower Defense Game Alpha

This document lists all known bugs and issues that need to be fixed to create a functional alpha prototype.

## 🚨 Critical Errors

### App.tsx
- **ReferenceError on Startup**: `handleRetry` function (lines 216-225) is used in useEffect (lines 208-214) before it's defined, causing a ReferenceError when the app starts.

## ⚠️ Severe Bugs

### App.tsx
- **Memory Leaks & Performance Issues**: useEffect for keyboard handlers (lines 154-204) has incomplete dependencies - all handler functions are recreated on every render, causing memory leaks and performance issues.

### GameHUD.tsx
- **CustomEvent Anti-Pattern**: Uses `window.dispatchEvent(new CustomEvent('resetGame'))` (lines 148 and 182) instead of React props for communication, creating poor architecture and difficult debugging.

### TowerPicker.tsx
- **Inconsistent Logic**: Button calls `onSelect(type)` even when not affordable (lines 36-37), then sets `disabled={!isAffordable}` (line 39), creating inconsistent behavior.

### GameController.ts
- **Undefined Access Risk**: `quickSetWave()` (lines 274-285) doesn't properly check if waves array is empty before accessing `this.state.waves.length - 1`.
- **Race Condition**: `notify()` is sometimes skipped after Game Over, preventing UI from receiving last update.

### CanvasRenderer.ts
- **Potential Crash**: Projectile gradient creation (lines 298-303) uses string manipulation for colors and can crash with invalid hex codes.

## 🐛 Functional Problems

## 🎨 UI/UX Weaknesses

### index.css
- **CSS Error**: `.volume-control` rule is defined twice with different styles (lines 298-323 and around line 567), with second definition being ignored.
- **Unmaintainable Media Queries**: Responsive design media queries are deeply nested and unorganized, making them difficult to maintain.

### App.tsx
- **Missing Accessibility**: No ARIA labels, no focus trap in overlays, no role="dialog" attributes.
- **No Loading States**: Canvas remains empty during audio initialization with no loading indicators.

### GameControls.tsx
- **No Visual Feedback**: Audio sliders have no visual feedback when values change.

### TowerPicker.tsx
- **Confusing Warning**: "Insufficient funds" warning appears even when a tower is selected, which is confusing to users.


