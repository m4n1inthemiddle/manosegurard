/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          subtle: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        card: '0 0 0 1px rgb(15 23 42 / 0.06), 0 4px 24px -4px rgb(15 23 42 / 0.08)',
        'card-hover': '0 0 0 1px rgb(37 99 235 / 0.12), 0 12px 40px -8px rgb(37 99 235 / 0.15)',
        glow: '0 0 60px -12px rgb(37 99 235 / 0.35)',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px)`,
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(37 99 235 / 0.15), transparent)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
