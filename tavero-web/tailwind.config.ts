import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    'rgb(var(--color-primary) / <alpha-value>)',
        accent:     'rgb(var(--color-accent) / <alpha-value>)',
        accentSoft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        muted:      'rgb(var(--color-muted) / <alpha-value>)',
        border:     'rgb(var(--color-border) / <alpha-value>)',
        surface:    'rgb(var(--color-surface) / <alpha-value>)',
        bg:         'rgb(var(--color-bg) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
