/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ======================= YENİ EKLENEN BÖLÜM: Apple Renk Paleti =======================
      colors: {
        'apple-blue': '#0A84FF',    // Ana etkileşim rengi
        'apple-green': '#30D158',   // Pozitif / Kâr
        'apple-red': '#FF453A',      // Negatif / Zarar / Silme
        
        // Koyu Tema Renkleri
        'apple-dark-bg': '#000000', // Ana arka plan (Siyah)
        'apple-dark-card': '#1C1C1E', // Kart arka planı (Koyu Gri)
        'apple-dark-text-primary': '#FFFFFF', // Ana metin (Beyaz)
        'apple-dark-text-secondary': '#8E8E93', // İkincil metin (Gri)
        
        // Açık Tema Renkleri
        'apple-light-bg': '#F2F2F7', // Ana arka plan (Kirli Beyaz)
        'apple-light-card': '#FFFFFF', // Kart arka planı (Beyaz)
        'apple-light-text-primary': '#000000', // Ana metin (Siyah)
        'apple-light-text-secondary': '#8A8A8E', // İkincil metin (Gri)
      }
      // ====================================================================================
    },
  },
  plugins: [],
}

