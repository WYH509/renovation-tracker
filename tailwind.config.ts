import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // iOS System Colors
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          purple: '#AF52DE',
          pink: '#FF2D55',
          teal: '#5AC8FA',
          indigo: '#5856D6',
        },
        // iOS System Backgrounds
        'ios-bg': {
          primary: '#F2F2F7',
          secondary: '#FFFFFF',
          tertiary: '#F9F9F9',
          grouped: '#F2F2F7',
          'grouped-secondary': '#FFFFFF',
        },
        // iOS Text Colors
        'ios-text': {
          primary: '#000000',
          secondary: '#3C3C43',
          tertiary: '#3C3C43',
          quaternary: '#3C3C43',
          placeholder: '#C7C7CC',
        },
        // iOS Separators
        'ios-separator': '#C6C6C8',
        // Keep existing primary colors
        primary: {
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
        },
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '14px',
        'ios-xl': '18px',
      },
      boxShadow: {
        'ios': '0 1px 3px rgba(0,0,0,0.08)',
        'ios-md': '0 4px 12px rgba(0,0,0,0.08)',
        'ios-lg': '0 8px 24px rgba(0,0,0,0.12)',
      },
      spacing: {
        'ios': '16px',
        'ios-lg': '20px',
        'ios-xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
