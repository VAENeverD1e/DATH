/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        'brand-deep': '#0f2340',
        'brand-accent': '#b9374a'
      }
    },
  },
  plugins: [],
};
