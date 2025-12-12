# Icon Setup Instructions

This guide explains how icons are configured in BiesyDefence and how to fix common issues.

## Overview

BiesyDefence uses **Fluent Icons** from Microsoft via the `unplugin-icons` package, which provides on-demand icon loading and TypeScript support.

## Current Setup

### 1. Dependencies (Already Installed)
```json
{
  "devDependencies": {
    "@iconify-json/fluent": "^1.2.15",
    "unplugin-icons": "^0.21.2"
  }
}
```

### 2. Vite Configuration (`vite.config.ts`)
```typescript
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [
    Icons({
      compiler: 'jsx',
      jsx: 'react',
      autoInstall: true,
    }),
  ],
})
```

### 3. TypeScript Declaration (`src/vite-env.d.ts`)
```typescript
/// <reference types="vite/client" />

declare module '~icons/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}
```

This file provides TypeScript support for the `~icons/*` virtual imports.

### 4. TSConfig (`tsconfig.json`)
The `tsconfig.json` already includes:
```json
{
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx"]
}
```
This ensures `vite-env.d.ts` is picked up automatically.

## Steps to Fix Icon Import Errors

If you see errors like `Failed to resolve import "~icons/fluent/..."`, follow these steps:

### Step 1: Verify Dependencies
```bash
npm install
```

### Step 2: Clear Cache
```bash
# Remove Vite cache
rm -rf node_modules/.vite

# Or use the clean script
npm run clean
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Verify Icons
Run the verification script:
```bash
npm run icons:verify
```

This will scan your codebase and verify all icon imports.

## Icon Usage

### Import and Use Icons
```tsx
import IconFluentPlay24Filled from '~icons/fluent/play-24-filled';

function MyComponent() {
  return (
    <button>
      <IconFluentPlay24Filled className="w-4 h-4" />
      Play
    </button>
  );
}
```

### Icon Naming Convention
Icons follow this pattern: `[name]-[size]-[variant]`

Examples:
- `play-24-filled` - Play icon, 24px, filled variant
- `money-24-regular` - Money icon, 24px, regular variant
- `heart-24-filled` - Heart icon, 24px, filled variant

### Finding Icons
Browse available icons at:
- **Iconify Explorer**: https://icon-sets.iconify.design/fluent/
- Search by name or browse categories
- Click on an icon to see its identifier

## Current Icons in Project

| Component | Icon | Usage |
|-----------|------|-------|
| AudioMini | `speaker-2-24-filled` | Volume on |
| AudioMini | `speaker-mute-24-filled` | Volume muted |
| PauseButton | `play-24-filled` | Play/Resume |
| PauseButton | `pause-24-filled` | Pause |
| WaveControl | `play-24-filled` | Start wave |
| WaveControl | `pause-24-filled` | Pause wave |
| WaveControl | `next-24-filled` | Next wave |
| HUD | `money-24-filled` | Money display |
| HUD | `heart-24-filled` | Lives display |
| HUD | `trophy-24-filled` | Score display |
| HUD | `weather-hail-night-24-filled` | Wave indicator |
| TowerShop | `money-24-regular` | Tower cost |
| GameControlPanel | `building-24-regular` | Tower icon |

## Troubleshooting

### Icon Not Found Error
**Problem**: `Failed to resolve import "~icons/fluent/some-icon"`

**Solutions**:
1. Verify the icon exists at https://icon-sets.iconify.design/fluent/
2. Check spelling and use the exact name from Iconify
3. Ensure the icon variant exists (`filled` or `regular`)
4. Try restarting the dev server

### TypeScript Errors
**Problem**: TypeScript complains about icon imports

**Solution**:
1. Ensure `src/vite-env.d.ts` exists
2. Restart your IDE/TS server
3. Run `npm run type-check` to verify

### Icons Not Rendering
**Problem**: Icons import but don't show up

**Solutions**:
1. Verify the icon component is used correctly: `<IconName className="w-4 h-4" />`
2. Check Tailwind classes are applied
3. Inspect element in browser dev tools
4. Ensure parent element has proper styling

### Build Errors
**Problem**: Icons work in dev but fail in build

**Solutions**:
1. Clear build cache: `npm run clean`
2. Rebuild: `npm run build`
3. Check console for specific error messages

## Adding New Icons

1. **Find Icon**: Browse https://icon-sets.iconify.design/fluent/
2. **Import**: Add import statement
   ```tsx
   import IconFluentYourIcon24Filled from '~icons/fluent/your-icon-24-filled';
   ```
3. **Use**: Add to component
   ```tsx
   <IconFluentYourIcon24Filled className="w-4 h-4" />
   ```
4. **Verify**: Run `npm run icons:verify`

## Performance Notes

- Icons are tree-shakeable and only bundled if used
- Virtual imports are resolved at build time
- No runtime performance impact
- Each icon is ~1-2KB gzipped

## Alternative Icon Sets

If you need icons from other sets, install the corresponding package:

```bash
# Material Design Icons
npm install --save-dev @iconify-json/mdi

# Heroicons
npm install --save-dev @iconify-json/heroicons

# Font Awesome
npm install --save-dev @iconify-json/fa6-solid
```

Then import:
```tsx
import IconMdiHeart from '~icons/mdi/heart';
import IconHeroHeart from '~icons/heroicons/heart';
```

## References

- [unplugin-icons Documentation](https://github.com/unplugin/unplugin-icons)
- [Iconify Icon Sets](https://icon-sets.iconify.design/)
- [Fluent UI Icons](https://icon-sets.iconify.design/fluent/)
- [Project Icon Reference](./ICONS_REFERENCE.md)
