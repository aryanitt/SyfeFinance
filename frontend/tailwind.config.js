/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          surface: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          primary: '#0d9488',
          'primary-hover': '#0f766e',
          heading: '#1e293b',
          body: '#475569',
          muted: '#64748b',
          /* aliases used across components */
          bg: '#f8fafc',
          blue: '#0d9488',
          navy: '#1e293b',
          green: '#16a34a',
          red: '#dc2626',
          orange: '#ea580c',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        finance: '0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.04)',
        'finance-lg': '0 4px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
