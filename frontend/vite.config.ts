import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  server: {
    port: 5173,
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: "http://localhost:8080",
              changeOrigin: true,
              secure: false,
            },
            "/auth": {
              target: "http://localhost:8080",
              changeOrigin: true,
              secure: false,
            },
            "/ws": {
              target: "ws://localhost:8080",
              ws: true,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
  },
}));
