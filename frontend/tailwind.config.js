/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50:'#f0f4ff', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca' },
        accent:  { 400:'#a78bfa', 500:'#8b5cf6' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      backgroundImage: {
        'grad-hero': 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        'grad-card': 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.1))'
      }
    }
  },
  plugins: []
};