import { defineConfig, preview } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
