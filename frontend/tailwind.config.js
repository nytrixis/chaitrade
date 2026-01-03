/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage-green': {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#b9dccb',
          300: '#8cc5a8',
          400: '#5fa984',
          500: '#3d8b68',
          600: '#2d6f53',
          700: '#245943',
          800: '#1f4737',
          900: '#1a3b2e',
        },
        'charcoal': {
          DEFAULT: '#1a1a1a',
        },
        'dark-gray': {
          DEFAULT: '#2d2d2d',
        },
        'medium-gray': {
          DEFAULT: '#4a4a4a',
        },
        'light-gray': {
          DEFAULT: '#9ca3af',
        },
        'off-white': {
          DEFAULT: '#f9fafb',
        },
      },
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'poppins': ['system-ui', '-apple-system', 'sans-serif'],
        'inter': ['system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  safelist: [
    'bg-charcoal',
    'bg-dark-gray',
    'bg-sage-green-500',
    'bg-sage-green-600',
    'text-sage-green-500',
    'text-sage-green-400',
    'text-light-gray',
    'text-off-white',
    'border-medium-gray',
    'hover:bg-sage-green-600',
    'hover:text-sage-green-500',
  ],
  plugins: [],
};
