/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#000000',
          100: '#000000',
          200: '#000000',
          300: '#000000',
          400: '#000000',
          500: '#000000',
          600: '#333333',
          700: '#666666',
          800: '#999999',
          900: '#cccccc',
        },
        flag_red: {
          DEFAULT: '#d61e30',
          100: '#2b060a',
          200: '#560c14',
          300: '#81121d',
          400: '#ab1827',
          500: '#d61e30',
          600: '#e44555',
          700: '#eb7480',
          800: '#f2a2aa',
          900: '#f8d1d5',
        },
        platinum: {
          DEFAULT: '#eeeeee',
          100: '#2f2f2f',
          200: '#5f5f5f',
          300: '#8e8e8e',
          400: '#bebebe',
          500: '#eeeeee',
          600: '#f1f1f1',
          700: '#f4f4f4',
          800: '#f8f8f8',
          900: '#fbfbfb',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
