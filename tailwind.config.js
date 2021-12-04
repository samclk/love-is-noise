module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['apparat', 'sans-serif']
      },
      colors: {
        primary: '#FEEA14'
      }
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '3rem',
        lg: '4.5rem',
        xl: '6rem'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [require('@tailwindcss/aspect-ratio')]
}
