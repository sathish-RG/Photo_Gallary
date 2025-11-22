/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Blue 600
        secondary: '#1e40af', // Blue 800
        accent: '#60a5fa', // Blue 400
        background: '#eff6ff', // Blue 50
      }
    },
  },
  plugins: [],
}
