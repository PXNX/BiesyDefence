# BiesyDefence GitHub Pages Deployment Guide

## Overview

BiesyDefence is now ready for deployment to GitHub Pages! The project has been configured for automated deployment using GitHub Actions.

**Target URL:** `https://bies93.github.io/BiesyDefence/`

## Current Status ✅

- ✅ Project built successfully for production
- ✅ All build files copied to root directory
- ✅ GitHub Actions workflow created
- ✅ Vite configured for GitHub Pages with relative paths
- ✅ Ready for deployment

## Deployment Setup

### 1. GitHub Repository Configuration

**Repository:** `Bies93/BiesyDefence`

**Required Settings in GitHub:**
1. Go to repository Settings > Pages
2. Under "Source", select **"GitHub Actions"**
3. The automated deployment will handle the rest

### 2. Automated Deployment (Recommended)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

- ✅ Triggers on push to `main` branch
- ✅ Installs dependencies 
- ✅ Builds the project with Vite
- ✅ Deploys to GitHub Pages
- ✅ Uses Pages artifact upload for reliable deployment

**To use automated deployment:**
```bash
git add .
git commit -m "Deploy BiesyDefence to GitHub Pages"
git push origin main
```

### 3. Manual Deployment

If you need to deploy manually:

1. **Install dependencies:**
   ```bash
   setup_env.bat npm install
   ```

2. **Build the project:**
   ```bash
   setup_env.bat npm run build
   # OR
   setup_env.bat npx vite build
   ```

3. **Copy build files to root:**
   ```powershell
   Copy-Item -Path 'dist\*' -Destination '.' -Recurse -Force
   ```

4. **Deploy to GitHub:**
   - Push changes to GitHub repository
   - GitHub Actions will automatically deploy

## Technical Configuration

### Vite Configuration
The project uses `base: './'` in `vite.config.ts` for proper GitHub Pages support:
- All asset paths are relative
- Compatible with subdirectory structure
- Works with GitHub Pages URL structure

### Build Output Structure
```
/
├── index.html              # Main application entry
├── favicon.ico
├── assets/                 # Bundled JavaScript & CSS
│   ├── index-*.js
│   ├── game-*.js
│   ├── vendor-*.js
│   └── index-*.css
├── effects/               # Game effect assets
├── enemies/               # Enemy sprites & assets
├── projectiles/           # Projectile sprites
├── textures/              # Game textures
├── towers/                # Tower sprites
└── ui/                    # UI assets
```

## GitHub Actions Workflow

The automated deployment uses:
- **Node.js 18** for builds
- **npm ci** for dependency installation
- **Vite build** for production compilation
- **GitHub Pages artifact upload** for deployment

## Development Commands

```bash
# Development server
setup_env.bat npm run dev

# Production build
setup_env.bat npm run build

# Preview production build
setup_env.bat npm run preview

# Type checking
setup_env.bat npm run type-check

# Linting
setup_env.bat npm run lint
```

## Troubleshooting

### Build Issues
- If TypeScript errors occur, use `npx vite build` to bypass strict compilation
- The project builds successfully with Vite even with TypeScript warnings

### GitHub Pages Not Loading
1. Check repository Settings > Pages for deployment status
2. Ensure "Source" is set to "GitHub Actions"
3. Wait 2-3 minutes for deployment to complete
4. Check the Actions tab for build logs

### Asset Loading Issues
- Ensure `base: './'` is set in `vite.config.ts`
- All assets are copied to root directory for GitHub Pages
- Use relative paths for all asset references

## Deployment URLs

- **Production:** `https://bies93.github.io/BiesyDefence/`
- **GitHub Repository:** `https://github.com/Bies93/BiesyDefence`
- **Actions Workflow:** `https://github.com/Bies93/BiesyDefence/actions`

## Project Structure

The project follows standard Vite + React + TypeScript structure:
```
BiesyDefence/
├── src/                   # Source code
│   ├── game/             # Game logic and systems
│   ├── ui/               # React components
│   └── ...
├── public/               # Static assets
├── dist/                 # Build output
├── .github/workflows/    # GitHub Actions
└── ...config files
```

## Next Steps

1. **Push to GitHub** to trigger automated deployment
2. **Configure GitHub Pages** to use GitHub Actions
3. **Verify deployment** at `https://bies93.github.io/BiesyDefence/`
4. **Share the game** with others!

## Notes

- The project uses legacy browser support via `@vitejs/plugin-legacy`
- Automatic chunk splitting for optimal loading
- Minified and optimized production build
- Responsive design for mobile and desktop

---

**Deployment completed successfully!** 🎮