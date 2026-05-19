/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        titan: {
          black: "#030303",
          void: "#080809",
          panel: "#0e0e11",
          elevated: "#141418",
          line: "#232328",
          gold: "#c9a227",
          goldBright: "#e8c547",
          goldDim: "#7a6a2e",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        display: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:
          "0 0 0 1px rgba(201, 162, 39, 0.06), 0 20px 50px -20px rgba(0, 0, 0, 0.85)",
        glow: "0 0 40px -10px rgba(201, 162, 39, 0.25)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease-out forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
