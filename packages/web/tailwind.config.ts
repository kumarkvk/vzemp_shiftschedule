import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--color-brand))',
          dark: 'hsl(var(--color-brand-dark))',
          muted: 'hsl(var(--color-brand-muted))',
        },
        surface: 'hsl(var(--color-surface))',
        border: 'hsl(var(--color-border))',
        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        danger: 'hsl(var(--color-danger))',
      },
      boxShadow: {
        soft: '0 16px 60px -32px rgb(15 23 42 / 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
