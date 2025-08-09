import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Döviz API'si için proxy
      '/api_currency': {
        target: 'https://api.frankfurter.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_currency/, ''),
      },
      // Altın API'si için KESİN DÜZELTME
      '/api_gold': {
        target: 'https://finance.truncgil.com',
        changeOrigin: true,
        // /api_gold ile başlayan bir isteği /api olarak değiştirir.
        // Örn: /api_gold/today -> /api/today
        rewrite: (path) => path.replace(/^\/api_gold/, '/api'),
      },
    }
  }
})
