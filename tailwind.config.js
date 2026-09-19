/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
        },
        iq: {
          teal: '#0e8a85',
          tealdark: '#0a7a78',
          tealsoft: '#ddefe6',
          green: '#1ba87a',
          navy: '#0f1b3d',
          muted: '#4a5675',
          faint: '#8a93aa',
          sage: '#cfe9db',
          blue: '#dcebfa',
          lavender: '#ece6f8',
          mint: '#e2f5ec',
          butter: '#fbf1cc',
          bg: '#f8fbfa',
          surface: '#ffffff',
          danger: '#d64545',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', '"Segoe Print"', 'cursive'],
        brush: ['"Caveat Brush"', '"Caveat"', 'cursive'],
      },
      borderRadius: {
        card: '20px',
        panel: '16px',
        btn: '14px',
        tag: '8px',
      },
      boxShadow: {
        nav: '0 8px 28px rgba(15,27,61,0.06)',
        cta: '0 10px 24px rgba(14,138,133,0.22)',
        none: 'none',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};