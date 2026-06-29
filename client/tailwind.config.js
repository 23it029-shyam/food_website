/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          dark: '#131921',
          lightDark: '#232f3e',
          orange: '#FF9900',
          orangeHover: '#e68a00',
          gold: '#FEBD69',
          bodyBg: '#eaeded',
          cardBg: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
