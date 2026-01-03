/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary greens (pleasant, not neon)
        'sage-green': {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#b9dccb',
          300: '#8cc5a8',
          400: '#5fa984',
          500: '#3d8b68', // Main green
          600: '#2d6f53',
          700: '#245943',
          800: '#1f4737',
          900: '#1a3b2e',
        },
        // Grays
        'charcoal': '#1a1a1a',      // Dark gray for backgrounds
        'dark-gray': '#2d2d2d',     // Slightly lighter
        'medium-gray': '#4a4a4a',   // For borders
        'light-gray': '#9ca3af',    // For text
        // Accent
        'off-white': '#f9fafb',     // Not pure white
      },
      fontFamily: {
        'inter': ['var(--font-inter)'],
        'poppins': ['var(--font-poppins)'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
