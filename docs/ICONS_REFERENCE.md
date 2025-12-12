# Icon Reference

This document lists all Fluent icons used in the BiesyDefence project via `unplugin-icons`.

## Icon Package
- **Package**: `@iconify-json/fluent`
- **Import Pattern**: `~icons/fluent/[icon-name]`

## Icons Used

### Audio Controls (`src/ui/components/AudioMini.tsx`)
- `~icons/fluent/speaker-2-24-filled` - Volume on icon
- `~icons/fluent/speaker-mute-24-filled` - Mute icon

### Game Controls (`src/ui/components/PauseButton.tsx`)
- `~icons/fluent/play-24-filled` - Play/Resume button
- `~icons/fluent/pause-24-filled` - Pause button

### Wave Controls (`src/ui/components/WaveControl.tsx`)
- `~icons/fluent/play-24-filled` - Start wave
- `~icons/fluent/pause-24-filled` - Pause wave
- `~icons/fluent/next-24-filled` - Next wave

### HUD Stats (`src/ui/components/HUD.tsx`)
- `~icons/fluent/money-24-filled` - Money/Currency display
- `~icons/fluent/heart-24-filled` - Lives display
- `~icons/fluent/trophy-24-filled` - Score display
- `~icons/fluent/weather-hail-night-24-filled` - Wave indicator

### Tower Shop (`src/ui/components/TowerShop.tsx`)
- `~icons/fluent/money-24-regular` - Tower cost display

### Game Control Panel (`src/ui/components/GameControlPanel.tsx`)
- `~icons/fluent/building-24-regular` - Tower building icon

## Setup

### TypeScript Declaration
The file `src/vite-env.d.ts` provides TypeScript support for icon imports:

```typescript
/// <reference types="vite/client" />

declare module '~icons/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}
```

### Vite Configuration
Icons are configured in `vite.config.ts`:

```typescript
Icons({
  compiler: 'jsx',
  jsx: 'react',
  autoInstall: true,
})
```

## Usage Example

```tsx
import IconFluentPlay24Filled from '~icons/fluent/play-24-filled';

function MyComponent() {
  return <IconFluentPlay24Filled className="w-4 h-4" />;
}
```

## Troubleshooting

If you encounter import errors:

1. **Restart the dev server**: `npm run dev`
2. **Clear Vite cache**: `rm -rf node_modules/.vite`
3. **Verify icon name**: Check [Iconify Fluent Collection](https://icon-sets.iconify.design/fluent/)
4. **Reinstall icon package**: `npm install --save-dev @iconify-json/fluent`

## Finding New Icons

Browse available Fluent icons at:
- https://icon-sets.iconify.design/fluent/

The naming convention follows this pattern:
- `[icon-name]-[size]-[variant]`
- Example: `play-24-filled`, `money-24-regular`, `heart-24-filled`

Common sizes: `16`, `20`, `24`, `28`, `32`, `48`
Common variants: `filled`, `regular`
