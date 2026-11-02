/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0C0E',
        surface: '#131519',
        border: '#23262D',
        primary: '#F3F1EC',
        muted: '#8E929F',
        accent: {
          terracotta: '#E06D53',
          sage: '#4E9F76'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
