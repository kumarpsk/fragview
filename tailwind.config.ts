/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        hedvig: ['var(--font-hedvig)'],
        inter: ['var(--font-inter)'],
        averia: ['var(--font-averia)'],
      },
      colors: {
        // Figma header palette primitives (Home page)
        'fv-ink': '#211F1C',
        'fv-parchment': '#FFF9EF',
        'fv-parchment-border': '#ECE0CF',
        'fv-sand-border': '#D9CDB9',
        'fv-gold': '#B28845',
        'fv-gold-dark': '#9E7127',
        'fv-olive': '#8A6A35',
        'fv-border': '#E2E1E1',
        'fv-border-strong': '#C4C4C3',
        'fv-text-muted': '#4A4946',

        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'pastel-blue': '#a8e6cf',
        'pastel-purple': '#dda0dd',
        'pastel-pink': '#ffb3ba',
        'pastel-yellow': '#ffdfba',
      },
      gradientColorStops: {
        'gradient-primary': '#0ea5e9',
        'gradient-secondary': '#8b5cf6',
      }
    },
  },
  plugins: [],
}