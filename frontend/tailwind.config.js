/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 18px 50px rgba(15, 23, 42, 0.25)',
      },
      colors: {
        cyber: {
          dark: '#07111f',
          panel: '#0f172a',
          card: '#111827',
          subtle: '#1f2937',
          cyan: '#67e8f9',
          teal: '#2dd4bf',
          amber: '#fbbf24',
          red: '#f87171',
          green: '#34d399',
          purple: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
};
