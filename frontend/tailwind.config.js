/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Primary Brand Color
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#4F46E5'
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
          DEFAULT: '#16A34A'
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          DEFAULT: '#F59E0B'
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          DEFAULT: '#DC2626'
        },
        surface: {
          background: '#F8FAFC',
          card: '#FFFFFF',
          dark: '#0F172A',
          secondary: '#64748B'
        }
      },
      borderRadius: {
        card: '16px',
        subtle: '12px'
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 4px 10px -3px rgba(15, 23, 42, 0.05)',
        'card-hover':
          '0 20px 40px -5px rgba(15, 23, 42, 0.1), 0 10px 20px -5px rgba(15, 23, 42, 0.08)',
        'glow-brand': '0 0 20px -5px rgba(99, 102, 241, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        glass: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.1)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        blob: 'blob 7s infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite'
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
};
