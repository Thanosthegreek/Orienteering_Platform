// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keep the error overlay so we can see issues quickly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5212,          // 🔒 fixed port
    strictPort: true,    // ❗ if 5212 is busy, Vite will FAIL instead of switching ports
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/v3": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
