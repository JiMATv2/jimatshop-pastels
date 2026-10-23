import { defineConfig, preview } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // Absolute base so deep routes (/orders/:id) don't resolve assets under /orders/assets/.
  base: "/",
  preview: {
    allowedHosts: ["shop3.jimatlabs.com"],
    port: 4184,
    host: "::",
  },
  server: {
    host: "::",
    port: 8083,
  },
  assetsInclude: ["**/*.wasm"],
  plugins: [react()],
  optimizeDeps: {
    // jeep-sqlite (Stencil) + sql.js (WASM) can break when pre-bundled by Vite.
    exclude: ["jeep-sqlite"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
