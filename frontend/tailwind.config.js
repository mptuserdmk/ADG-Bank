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
        revolut: {
          canvas: '#191C1F',
          dark: '#121417',
          cardSolid: '#242629',
          blue: '#0666EB',
          blueHover: '#0A84FF',
          purple: '#984CFF',
          purpleLight: '#B985FF',
          pink: '#E950A4',
          orange: '#EC7E00',
          green: '#10B981',
          muted: '#75808A',
          platinum: '#CDD3DA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        'widget': '28px',
        'card': '18px',
        'modal': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'glass': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
        'float': '0 12px 36px -8px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        'revolut': '20px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}

