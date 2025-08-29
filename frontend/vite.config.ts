import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Leave overlay ON so we see errors if they happen.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/v3":  { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});
