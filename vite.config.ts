import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isAnalyze = command === 'build' && process.env.ANALYZE

  return {
    root: '.',
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            game: ['./src/game/core/GameController', './src/game/rendering/CanvasRenderer'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      cors: true,
    },
    preview: {
      port: 4173,
      host: true,
      cors: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    define: {
      __DEV__: !isProduction,
      __PROD__: isProduction,
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    plugins: [
      react({
        // Enable React Fast Refresh
        fastRefresh: !isProduction,
        // Optimize JSX in production
        jsxRuntime: 'automatic',
      }),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        autoInstall: true,
      }),
      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        modernPolyfills: true,
      }),
      // Bundle analyzer for production builds
      ...(isAnalyze ? [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        })
      ] : []),
    ],
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@types/node'],
    },
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/variables.scss";`,
        },
      },
    },
    worker: {
      format: 'es',
    },
    // Performance optimizations
    cacheDir: 'node_modules/.vite',
    publicDir: 'public',
  }
})
