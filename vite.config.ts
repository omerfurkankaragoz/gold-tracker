import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// EKSİK OLAN SATIR BURAYA EKLENDİ
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Birikim',
        short_name: 'Birikim',
        description: 'Kişisel yatırım ve birikim takibi uygulaması.',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  // MEVCUT PROXY AYARLARINIZ KORUNDU
  server: {
    proxy: {
      '/api_currency': {
        target: 'https://api.frankfurter.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_currency/, ''),
      },
      '/api_gold': {
        target: 'https://finance.truncgil.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_gold/, '/api'),
      },
    }
  }
})