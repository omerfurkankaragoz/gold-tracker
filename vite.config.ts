import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Döviz API'si için proxy (Frankfurter)
      '/api_currency': {
        target: 'https://api.frankfurter.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_currency/, ''),
      },
      // Altın API'si için proxy (Truncgil)
      '/api_gold': {
        target: 'https://finans.truncgil.com/v4/today.json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_gold/, ''),
      },
    }
  }
})