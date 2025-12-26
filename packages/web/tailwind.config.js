/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0F13",
        card: "#1A1A22",
        border: "#2E2E36",
        accent: {
          primary: "#6366F1",
          secondary: "#A855F7",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
      },
      boxShadow: {
        'accent-glow': '0 10px 20px rgba(168, 85, 247, 0.4)',
        'accent-glow-hover': '0 15px 30px rgba(168, 85, 247, 0.6)',
      }
    },
  },
  plugins: [],
}