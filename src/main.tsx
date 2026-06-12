import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { initSqlite } from "./lib/sqlite/sqlite";
import { seedCatalogIfEmpty } from "./lib/catalog/seed";
import { ensureLocationSchema } from "./lib/location/storage";
import { notificationService } from "./lib/notifications/notificationService";
import { initNativeSafeArea } from "./lib/native/safeArea";

async function bootstrap() {
  await initNativeSafeArea();

  // For browser debugging, this sets up jeep-sqlite + WASM + IndexedDB store.
  // For Android/iOS, it no-ops and uses the native SQLite engine.
  await initSqlite();
  await seedCatalogIfEmpty();
  await ensureLocationSchema();
  notificationService.init();

  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed", err);
  createRoot(document.getElementById("root")!).render(<App />);
});
