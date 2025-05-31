/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        sparkle: {
          'old-primary': '#01e5ff',
          primary: '#0095ff',
          secondary: '#005FFF'
        }
      }
    }
  }
}
