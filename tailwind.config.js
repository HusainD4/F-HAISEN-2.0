/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        surface: 'var(--bg-surface)',
        // ── Gold Palette ──────────────────────────────────
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          200: '#f4de95',
          300: '#ecc84e',
          400: '#e5b428',
          DEFAULT: '#d4af37',
          600: '#b8911e',
          700: '#936e18',
          800: '#79591a',
          900: '#674b1b',
        },
        // ── Dark Mode Surfaces ────────────────────────────
        charcoal: {
          DEFAULT: '#1e1e1e',
          50:  '#f5f5f5',
          100: '#ebebeb',
          200: '#d6d6d6',
          300: '#c2c2c2',
          400: '#adadad',
          500: '#999999',
          600: '#636363',
          700: '#424242',
          800: '#2a2a2a',  // card surface
          900: '#1e1e1e',  // page background
          950: '#111111',  // deeper background
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-sm': '0 1px 3px 0 rgba(212, 175, 55, 0.15)',
        'gold':    '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 10px 30px 0 rgba(212, 175, 55, 0.35)',
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'dark':    '0 4px 14px 0 rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 30px 0 rgba(0, 0, 0, 0.6)',
        'card':    '0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(212,175,55,0.06)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-right': 'slideOutRight 0.2s ease-in forwards',
        'fade-in':    'fadeIn 0.2s ease-out',
        'fade-out':   'fadeOut 0.15s ease-in forwards',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in':  'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'float':      'float 4s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideOutRight: {
          '0%':   { transform: 'translateX(0)',    opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
