import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    base: '/taekwondo-trainer-app/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/*.svg'],
            manifest: {
                name: 'TKD Trainer',
                short_name: 'TKD Trainer',
                description: 'Taekwondo Trainings- und Athletenverwaltung',
                lang: 'de',
                theme_color: '#1e3a5f',
                background_color: '#f5f6f8',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/taekwondo-trainer-app/',
                scope: '/taekwondo-trainer-app/',
                icons: [
                    { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
                    { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
                    { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,ico,wasm}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                navigateFallback: '/taekwondo-trainer-app/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
                        handler: 'CacheFirst',
                        options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    optimizeDeps: {
        exclude: [],
    }
});
