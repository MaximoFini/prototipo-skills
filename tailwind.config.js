/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        go: {
          primary: '#00522E',
          'primary-dark': '#003B20',
          'primary-tint': '#E6F2EB',
          danger: '#B8252B',
          'danger-dark': '#8E1C21',
          'danger-tint': '#FBE9EA',
          heart: '#D21B20',
          streak: '#F2A33A',
          'streak-text': '#A85A00',
          xp: '#F2C94C',
          'xp-dark': '#8A6A00',
          bg: '#FFFFFF',
          surface: '#F5F2F0',
          border: '#E4DDD9',
          'border-dark': '#CFC6C1',
          locked: '#D8CFCC',
          text: '#1B1B1B',
          muted: '#6B6360',
          gem: '#1F63B0',
        },
      },
      fontFamily: {
        display: ['Gabarito', 'system-ui', 'sans-serif'],
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: { go: '16px' },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        pop: { '0%': { transform: 'scale(.9)' }, '60%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: { shake: 'shake .3s ease-in-out', pop: 'pop .25s ease-out', float: 'float 2.4s ease-in-out infinite' },
    },
  },
  plugins: [],
}
