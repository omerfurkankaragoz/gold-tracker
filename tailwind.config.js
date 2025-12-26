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
        // iOS System Colors
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-yellow': '#FFCC00',
        'ios-purple': '#AF52DE',
        'ios-teal': '#5AC8FA',
        'ios-indigo': '#5856D6',
        'ios-pink': '#FF2D55',
        'ios-gray': '#8E8E93',
        'ios-gray-2': '#AEAEB2',
        'ios-gray-3': '#C7C7CC',
        'ios-gray-4': '#D1D1D6',
        'ios-gray-5': '#E5E5EA',
        'ios-gray-6': '#F2F2F7',

        // Semantic Colors
        'apple-blue': '#007AFF',
        'apple-green': '#34C759',
        'apple-red': '#FF3B30',

        // Background Colors
        'apple-dark-bg': '#000000',
        'apple-dark-card': '#1C1C1E',
        'apple-dark-card-elevated': '#2C2C2E',

        'apple-light-bg': '#F2F2F7',
        'apple-light-card': '#FFFFFF',
        'apple-light-card-elevated': '#F2F2F7',

        // Text Colors
        'apple-dark-text-primary': '#FFFFFF',
        'apple-dark-text-secondary': 'rgba(235, 235, 245, 0.6)',
        'apple-dark-text-tertiary': 'rgba(235, 235, 245, 0.3)',

        'apple-light-text-primary': '#000000',
        'apple-light-text-secondary': 'rgba(60, 60, 67, 0.6)',
        'apple-light-text-tertiary': 'rgba(60, 60, 67, 0.3)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'sans-serif',
        ]
      },
      boxShadow: {
        'ios-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'ios': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'ios-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'ios-float': '0 12px 32px rgba(0, 0, 0, 0.16)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
