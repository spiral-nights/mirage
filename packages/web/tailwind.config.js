/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#080808",
        card: "#0A0A0A",
        border: "#1A1A1A",
        vivid: {
          cyan: "#00C6FF",
          magenta: "#FF0080",
          teal: "#00F5D4",
          yellow: "#FFD700",
          blue: "#0072FF",
        },
        accent: {
          primary: "#00C6FF",
          secondary: "#0072FF",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Outfit"', "sans-serif"],
        serif: ['"Instrument Serif"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
        'vivid-rainbow': 'linear-gradient(90deg, #00F5D4, #00C6FF, #FF0080, #FFD700)',
      },
    },
  },
  plugins: [],
}