/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5722',
          pink: '#E91E63',
          purple: '#9C27B0',
          blue: '#2196F3',
          cyan: '#00BCD4',
          green: '#4CAF50',
          dark: '#0f172a',
          light: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
