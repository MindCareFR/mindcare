/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,js}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#5271FF', 
        secondary: '#10B981',
      }
    },
  },
  plugins: [],
}