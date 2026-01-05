import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const src = path.join(projectRoot, "node_modules", "sql.js", "dist", "sql-wasm.wasm");
const destDir = path.join(projectRoot, "public", "assets");
const dest = path.join(destDir, "sql-wasm.wasm");

try {
  if (!fs.existsSync(src)) {
    // sql.js is a transitive dependency of jeep-sqlite (via @capacitor-community/sqlite).
    // If it is missing, we simply skip the copy.
    process.exit(0);
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  // eslint-disable-next-line no-console
  console.log(`[postinstall] Copied sql-wasm.wasm -> ${path.relative(projectRoot, dest)}`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn("[postinstall] Failed to copy sql-wasm.wasm:", err?.message ?? err);
  // Don't fail installs on CI/dev machines that don't need web SQLite.
  process.exit(0);
}


