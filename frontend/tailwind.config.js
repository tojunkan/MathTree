/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        item: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#15803d',
        },
        theorem: {
          DEFAULT: '#f97316',
          light: '#fdba74',
          dark: '#c2410c',
        },
      },
    },
  },
  plugins: [],
};
