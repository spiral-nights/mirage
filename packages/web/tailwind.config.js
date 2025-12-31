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
          cyan: "#00FFFF",   // Triad Point 1
          magenta: "#FF00FF", // Triad Point 2
          yellow: "#FFFF00",  // Triad Point 3
          teal: "#00F5D4",    // Keeping for secondary
          blue: "#0072FF",    // Keeping for deep accents
        },
        accent: {
          primary: "#00FFFF",
          secondary: "#FF00FF",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Outfit"', "sans-serif"],
        serif: ['"Instrument Serif"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 50%, #FFFF00 100%)',
        'vivid-rainbow': 'linear-gradient(90deg, #00F5D4, #00C6FF, #FF0080, #FFD700)',
      },
    },
  },
  plugins: [],
}