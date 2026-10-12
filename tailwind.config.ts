import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'cta-gradient': 'linear-gradient(90deg, #892AF0 0%, #3D34D6 100%)'
      },
      colors: {
        'brand-blue': '#3836D6',
        'brand-cyan': '#3CC1CD'
      },
      fontFamily: {
        'days-one': ['Days One', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
