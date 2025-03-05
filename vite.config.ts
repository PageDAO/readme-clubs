import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import commonjs from 'vite-plugin-commonjs';



export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB
      },
      registerType: 'autoUpdate',
      manifest: {
        name: 'Readme Clubs',
        short_name: 'Readme',
        description: 'A progressive web app for book clubs and Web3 integration.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  define: {
    global: 'window',
    'process.env': {},
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
});