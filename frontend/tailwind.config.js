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
        av: {
          orange: '#F58220',
          'orange-hover': '#E56D00',
          'orange-light': '#FFF4EA',
          navy: '#0B3A70',
          'navy-hover': '#092E5A',
          'light-blue': '#EAF1F8',
          background: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          'text-dark': '#1E293B',
          'text-light': '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'av': '16px',
      },
      boxShadow: {
        'av-card': '0 2px 8px rgba(0,0,0,0.05)',
        'av-hover': '0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}