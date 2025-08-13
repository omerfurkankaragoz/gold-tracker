/** @type {import('tailwindcss').Config} */
export default {
  // ================= DEĞİŞİKLİK 1: Koyu Mod Eklendi =================
  darkMode: 'class', // 'class' stratejisini etkinleştiriyoruz
  // ====================================================================
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}