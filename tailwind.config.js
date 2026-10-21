/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090A0F',
          surface: '#11141E',
          card: '#151926',
          elevated: '#1D2233',
          border: '#23293D',
          borderLight: '#2C344D',
          muted: '#64748B',
          text: '#F8FAFC',
          textSecondary: '#94A3B8',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        neon: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};
