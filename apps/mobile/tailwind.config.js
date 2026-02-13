/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2F9E44',
        secondary: '#7A1E2B',
        surface: '#F5F9F2',
      },
    },
  },
  plugins: [],
};
