/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#18181b',
          2: '#1c1c1f',
        },
      },
      letterSpacing: {
        label: '0.15em',
      },
    },
  },
  plugins: [],
}
