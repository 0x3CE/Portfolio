import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F1E8D6',
        ink: '#231C15',
        teak: '#8C4A26',
        mustard: '#D9A320',
        olive: '#6E7B3B',
        teal: '#2E6A68',
        tomato: '#D8452B',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-instrument)', 'system-ui', 'sans-serif'],
        garamond: ['var(--font-garamond)', 'Georgia', 'serif'],
        pixel: ['var(--font-silkscreen)', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(3rem, 9vw, 8rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        section: ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.01em' }],
        body: ['1.0625rem', { lineHeight: '1.55' }],
        'body-lg': ['1.125rem', { lineHeight: '1.55' }],
        micro: ['0.625rem', { lineHeight: '1.4' }],
        'micro-lg': ['0.75rem', { lineHeight: '1.4' }],
      },
      borderWidth: { 2: '2px' },
      maxWidth: { shell: '82rem' },
      keyframes: {
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'marquee-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-right': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        'hero-rise': {
          from: { opacity: '0', transform: 'translateY(1.25rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 90s linear infinite',
        'marquee-left': 'marquee-left var(--marquee-duration, 40s) linear infinite',
        'marquee-right': 'marquee-right var(--marquee-duration, 40s) linear infinite',
        'hero-rise': 'hero-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
