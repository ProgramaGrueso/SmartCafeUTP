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
          primary: '#E86B6B',
          dark: '#E85757',
        },
        ai: {
          from: '#9333EA',
          to: '#EC4899',
          border: '#E9D5FF',
        },
        delivery: {
          accent: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
