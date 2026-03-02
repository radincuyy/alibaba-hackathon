/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F0EBE3',
          200: '#E8E2D8',
          300: '#D9D3CB',
          400: '#C4BDB3',
          500: '#9C968F',
          600: '#6B6560',
          700: '#4A4540',
          800: '#2D2A27',
          900: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#E85D2C',
          light: '#FFF0EB',
          hover: '#D14A1B',
          dark: '#B8401A',
        },
        forest: {
          DEFAULT: '#2D6A4F',
          light: '#E8F5EE',
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #F0EBE3 0%, #FAF8F5 50%, #F0EBE3 100%)',
        'gradient-accent': 'linear-gradient(135deg, #E85D2C 0%, #D14A1B 100%)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
        'button': '0 2px 8px rgba(232,93,44,0.25)',
        'soft': '0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
