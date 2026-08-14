import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const RENDER = "https://titan-cot.onrender.com";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/cot": {
        target: RENDER,
        changeOrigin: true,
        secure: true,
      },
      "/api/macro": {
        target: RENDER,
        changeOrigin: true,
        secure: true,
      },
      "/api/seasonality": {
        target: RENDER,
        changeOrigin: true,
        secure: true,
      },
      "/api/yahoo": {
        target: "https://query1.finance.yahoo.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ""),
      },
    },
  },
});
