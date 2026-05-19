/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        titan: {
          black: "#050505",
          void: "#0b0f14",
          panel: "#0f1118",
          elevated: "#151a22",
          line: "rgba(255,255,255,0.06)",
          gold: "#d4af37",
          goldBright: "#f0d060",
          goldDim: "#8a7844",
          bull: "#00d084",
          bear: "#ff4d6d",
          text: "#d0d0d0",
          muted: "#7d8590",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Cinzel", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px -40px rgba(0,0,0,0.95)",
        glow: "0 0 60px -16px rgba(212, 175, 55, 0.35)",
        glowBull: "0 0 40px -10px rgba(0, 208, 132, 0.45)",
        glowBear: "0 0 40px -10px rgba(255, 77, 109, 0.45)",
        insetGold: "inset 0 1px 0 0 rgba(240, 208, 96, 0.12)",
      },
      backgroundImage: {
        "titan-mesh":
          "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(212, 175, 55, 0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(0, 208, 132, 0.06), transparent)",
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
