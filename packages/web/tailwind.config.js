/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        card: "#0D0D12",
        border: "#1F1F26",
        vivid: {
          cyan: "#00D2FF",
          magenta: "#FF0080",
          teal: "#00F5D4",
          yellow: "#FFD700",
        },
        accent: {
          primary: "#FF0080", // Magenta
          secondary: "#00D2FF", // Cyan
        }
      },
      fontFamily: {
        sans: ['"Outfit"', "sans-serif"],
        serif: ['"Instrument Serif"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #FF0080 0%, #00D2FF 100%)',
        'vivid-rainbow': 'linear-gradient(90deg, #00F5D4, #00D2FF, #FF0080, #FFD700)',
      },
      boxShadow: {
        'vivid-glow': '0 0 20px rgba(255, 0, 128, 0.2)',
        'vivid-glow-cyan': '0 0 20px rgba(0, 210, 255, 0.2)',
      }
    },
  },
  plugins: [],
}