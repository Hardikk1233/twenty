import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the built app works from any folder on any static HTTPS host.
// Routing uses the URL hash, so no server rewrite rules are needed.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // A new version downloads in the background and the app reloads into it once it is ready.
      // Progress is saved after every tap, so the reload never loses an answer.
      registerType: 'autoUpdate',
      injectRegister: false,
      // The glob below already pre-caches the icons, so don't add them a second time.
      includeManifestIcons: false,
      manifest: {
        id: './',
        name: 'Twenty',
        short_name: 'Twenty',
        description: 'Finance in 30 days: one lesson of about 20 minutes and a quiz each day.',
        lang: 'en-IN',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBFBFA',
        theme_color: '#FBFBFA',
        categories: ['education', 'finance'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Pre-cache everything: the app, all 30 lessons (bundled into the JS), fonts and icons.
        // (The plugin adds the web app manifest itself.)
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
