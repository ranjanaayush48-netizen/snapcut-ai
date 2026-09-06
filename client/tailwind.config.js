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
        brand: {
          bg: '#050816',
          surface: '#080B1A',
          card: '#0B1026',
          cardHover: '#10173A',
          border: '#1C2450',
          borderHover: '#2A3777',
          cyan: '#00D9FF',
          blue: '#246BFF',
          violet: '#6C3BFF',
          magenta: '#F02BFF',
          textMuted: '#AAB3D0',
          textDim: '#707B9E'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00D9FF 0%, #246BFF 33%, #6C3BFF 66%, #F02BFF 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #1ae0ff 0%, #3d7cff 33%, #7d50ff 66%, #f347ff 100%)',
        'glow-radial': 'radial-gradient(circle, rgba(108, 59, 255, 0.15) 0%, rgba(5, 8, 22, 0) 70%)',
        'checkerboard': 'linear-gradient(45deg, #182042 25%, transparent 25%), linear-gradient(-45deg, #182042 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #182042 75%), linear-gradient(-45deg, transparent 75%, #182042 75%)'
      },
      backgroundSize: {
        'checker-size': '20px 20px'
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 217, 255, 0.35)',
        'glow-magenta': '0 0 25px -5px rgba(240, 43, 255, 0.35)',
        'glow-brand': '0 0 35px -5px rgba(108, 59, 255, 0.4)',
        'glow-sm': '0 0 15px -3px rgba(36, 107, 255, 0.3)'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear'
      }
    },
  },
  plugins: [],
}
