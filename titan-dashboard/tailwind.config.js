/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        titan: {
          black: "#020203",
          void: "#060608",
          panel: "#0c0c10",
          elevated: "#131318",
          line: "#25252d",
          gold: "#d4af37",
          goldBright: "#f0d060",
          goldDim: "#8a7844",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 0 0 1px rgba(212, 175, 55, 0.07), 0 24px 64px -28px rgba(0, 0, 0, 0.9)",
        glow: "0 0 48px -12px rgba(212, 175, 55, 0.22)",
        insetGold: "inset 0 1px 0 0 rgba(240, 208, 96, 0.08)",
      },
      backgroundImage: {
        "titan-mesh":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.09), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(56, 189, 248, 0.04), transparent)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
