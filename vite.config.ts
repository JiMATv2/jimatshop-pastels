import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Capacitor loads your built app from a local file URL on device.
  // Using a relative base ensures JS/CSS asset paths resolve correctly.
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
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
