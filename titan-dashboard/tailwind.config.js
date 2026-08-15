/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        titan: {
          black: "#02040a",
          void: "#060a12",
          panel: "#0a1018",
          elevated: "#101826",
          line: "rgba(255,255,255,0.06)",
          /* Legacy class names (`titan-gold*`) → neon blue accent */
          gold: "#2ea8ff",
          goldBright: "#7dd3fc",
          goldDim: "#2a6a9e",
          bull: "#00d084",
          bear: "#ff4d6d",
          text: "#e8eef4",
          muted: "#8a96a8",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Cinzel", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.05), 0 12px 32px -24px rgba(0,0,0,0.8)",
        glow: "0 0 28px -16px rgba(46, 168, 255, 0.28)",
        glowBull: "0 0 24px -16px rgba(0, 208, 132, 0.22)",
        glowBear: "0 0 24px -16px rgba(255, 77, 109, 0.22)",
        insetGold: "inset 0 1px 0 0 rgba(125, 211, 252, 0.1)",
      },
      backgroundImage: {
        "titan-mesh":
          "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(46, 168, 255, 0.08), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(46, 168, 255, 0.04), transparent)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        rayShift: {
          "0%": { opacity: "0.35", transform: "translateX(-4%) skewX(-12deg)" },
          "50%": { opacity: "0.65", transform: "translateX(4%) skewX(-12deg)" },
          "100%": { opacity: "0.35", transform: "translateX(-4%) skewX(-12deg)" },
        },
        pressure: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.25)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        ray: "rayShift 12s ease-in-out infinite",
        pressure: "pressure 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
