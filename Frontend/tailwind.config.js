/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette: green / cream / white
        brand: {
          50: '#f3faf4',
          100: '#e3f3e6',
          200: '#c7e7cd',
          300: '#9ad3a5',
          400: '#67b678',
          500: '#3f9953',
          600: '#2f7c42',
          700: '#266336',
          800: '#1f4f2c',
          900: '#1a4125',
          950: '#0c2414',
        },
        cream: {
          50: '#fffdf6',
          100: '#fff9e7',
          200: '#fff0c7',
          300: '#ffe39a',
          400: '#ffd06b',
          500: '#ffba43',
          600: '#f59e0b',
        },
        ink: {
          100: '#e6ebe7',
          300: '#a3aea6',
          400: '#7d8a80',
          500: '#5b6b5f',
          700: '#2f3f33',
          900: '#13251a',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(15, 60, 30, 0.15)',
        lift: '0 18px 40px -16px rgba(15, 60, 30, 0.25)',
        card: '0 2px 6px -2px rgba(15, 60, 30, 0.06), 0 10px 28px -12px rgba(15, 60, 30, 0.14)',
        float: '0 24px 60px -20px rgba(15, 60, 30, 0.32)',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #2f7c42 0%, #67b678 50%, #ffd06b 100%)',
        'cream-gradient':
          'linear-gradient(180deg, #fffdf6 0%, #fff9e7 100%)',
        'brand-soft-gradient':
          'linear-gradient(135deg, #e3f3e6 0%, #fff9e7 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'zoom-in': {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
        'slide-in-right': {
          '0%': { opacity: 0, transform: 'translateX(100%)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'zoom-in': 'zoom-in 0.45s ease-out both',
        marquee: 'marquee 30s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
