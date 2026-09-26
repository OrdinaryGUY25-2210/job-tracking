import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Cortex',
        short_name: 'Cortex',
        description: 'Cortex — pelacak lamaran kerja, keuangan, dan asisten interview AI.',
        theme_color: '#1F2A44',
        background_color: '#F2F4F7',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        // Semua route (/, /interview, /finance) harus jatuh balik ke index.html
        // supaya refresh atau buka langsung ke URL itu tetap jalan sebagai app
        // React, termasuk saat sudah ter-install (mode standalone) dan offline.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/supabase\//],
      },
    }),
  ],
  server: { port: 5173 },
});
