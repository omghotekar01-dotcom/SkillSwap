/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { 50: '#eff6ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
        accent: { 400: '#a78bfa', 500: '#8b5cf6' },
        surface: '#0b1120',
      },
      boxShadow: {
        soft: '0 25px 70px rgba(15, 23, 42, 0.18)',
        glow: '0 0 48px rgba(99, 102, 241, 0.15)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 20%), radial-gradient(circle at bottom right, rgba(168,85,247,0.12), transparent 24%)',
        'card-glow': 'linear-gradient(135deg, rgba(99,102,241,.12), rgba(139,92,246,.08))',
      },
      animation: {
        float: 'floatUp 8s ease-in-out infinite',
        glow: 'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
