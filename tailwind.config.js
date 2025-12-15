
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
      },
      colors: {
        'brand-green': '#0B4225',
        'brand-plum': '#341327',
        'brand-charcoal': '#3D3D3C',
        'brand-gray': '#6B7280',
        'brand-gray-dark': '#4B5563',
        'brand-light': '#F9FAFB',
        'brand-accent': '#D2B409',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
