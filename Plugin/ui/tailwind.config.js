/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        sona: {
          bg: '#0a0a0a',
          surface: '#141414',
          border: '#2a2a2a',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
        }
      }
    },
  },
  plugins: [],
}
