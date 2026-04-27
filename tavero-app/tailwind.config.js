/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './global.css',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background:   'rgb(var(--background) / <alpha-value>)',
        surface:      'rgb(var(--surface) / <alpha-value>)',
        primary:      'rgb(var(--primary) / <alpha-value>)',
        primaryLight: 'rgb(var(--primaryLight) / <alpha-value>)',
        accent:       'rgb(var(--accent) / <alpha-value>)',
        accentSoft:   'rgb(var(--accentSoft) / <alpha-value>)',
        muted:        'rgb(var(--muted) / <alpha-value>)',
        mutedLight:   'rgb(var(--mutedLight) / <alpha-value>)',
        border:       'rgb(var(--border) / <alpha-value>)',
        borderSoft:   'rgb(var(--borderSoft) / <alpha-value>)',
        danger:       'rgb(var(--danger) / <alpha-value>)',
        success:      'rgb(var(--success) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
