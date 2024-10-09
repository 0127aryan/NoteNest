export default {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#2B85FF',
        secondary: "#EF863E"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}