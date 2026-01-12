import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";

const DB_NAME = "appdb";
const DB_VERSION = 1;

type ChangesResult = { changes?: { changes?: number; lastId?: number; values?: any[] } };
type ValuesResult = { values?: any[] };

export type DbLike = {
  execute: (statements: string, transaction?: boolean) => Promise<ChangesResult>;
  query: (statement: string, values?: any[]) => Promise<ValuesResult>;
  run: (statement: string, values?: any[], transaction?: boolean) => Promise<ChangesResult>;
  executeSet: (
    set: { statement?: string; values?: any[] }[],
    transaction?: boolean,
  ) => Promise<ChangesResult>;
};

let sqlite: SQLiteConnection | null = null;
let nativeDb: SQLiteDBConnection | null = null;
let webDb: DbLike | null = null;
let initPromise: Promise<void> | null = null;

async function initWebSqlJsDb() {
  // Lightweight WASM SQLite for browser debugging:
  // - runs entirely in-browser via sql.js
  // - same SQL schema/migrations as native
  // - no persistence by default (good enough for dev/testing)
  const sqljsMod = (await import("sql.js/dist/sql-wasm.js")) as any;
  // Depending on bundler/format, sql.js can be exported as default, nested default, or module itself.
  const initSqlJs =
    (sqljsMod?.default?.default ??
      sqljsMod?.default ??
      sqljsMod?.Module ??
      sqljsMod) as any;
  if (typeof initSqlJs !== "function") {
    // Helpful diagnostics in dev if bundler interop changes
    console.debug(
      "sql.js import shape",
      JSON.stringify(
        {
          keys: Object.keys(sqljsMod ?? {}),
          defaultType: typeof sqljsMod?.default,
          defaultKeys: Object.keys(sqljsMod?.default ?? {}),
          defaultDefaultType: typeof sqljsMod?.default?.default,
          moduleType: typeof sqljsMod?.Module,
          selfType: typeof sqljsMod,
        },
        null,
        2,
      ),
    );
    throw new Error("sql.js init function not found");
  }
  
  // Resolve WASM file path correctly for Vite
  // Vite serves public/ assets at root in dev, and respects base: "./" in production
  const getWasmPath = (file: string): string => {
    const base = import.meta.env.BASE_URL || "/";
    // In dev, Vite serves from root, so /assets/ works
    // In production with base: "./", we need to resolve relative to base
    if (base === "/") {
      return `/assets/${file}`;
    }
    // For relative base, resolve using URL constructor
    const baseUrl = new URL(base, window.location.href);
    const wasmUrl = new URL(`assets/${file}`, baseUrl);
    return wasmUrl.pathname;
  };

  let SQL;
  try {
    SQL = await initSqlJs({
      locateFile: getWasmPath,
    });
  } catch (error: any) {
    // If WASM loading fails, provide helpful error message
    console.error("Failed to initialize sql.js WASM:", error);
    const wasmPath = getWasmPath("sql-wasm.wasm");
    console.error(`Attempted to load WASM from: ${wasmPath}`);
    console.error("Make sure sql-wasm.wasm exists in public/assets/");
    throw new Error(
      `Failed to load SQLite WASM module: ${error?.message || String(error)}. ` +
      `Check that ${wasmPath} is accessible and is a valid WASM file.`
    );
  }
  
  const db = new SQL.Database();

  webDb = {
    async execute(statements: string) {
      db.exec(statements);
      return { changes: { changes: 0 } };
    },
    async query(statement: string, values?: any[]) {
      const stmt = db.prepare(statement);
      try {
        if (values?.length) stmt.bind(values);
        const out: any[] = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          out.push(row);
        }
        return { values: out };
      } finally {
        stmt.free();
      }
    },
    async run(statement: string, values?: any[]) {
      db.run(statement, values ?? []);
      return { changes: { changes: 1 } };
    },
    async executeSet(set, transaction = true) {
      if (transaction) db.run("BEGIN;");
      try {
        for (const item of set) {
          if (!item.statement) continue;
          const vals = item.values ?? [];
          // Support both single row values and array-of-rows values
          if (Array.isArray(vals[0])) {
            for (const rowVals of vals as any[]) {
              db.run(item.statement, rowVals);
            }
          } else {
            db.run(item.statement, vals);
          }
        }
        if (transaction) db.run("COMMIT;");
        return { changes: { changes: set.length } };
      } catch (e) {
        if (transaction) db.run("ROLLBACK;");
        throw e;
      }
    },
  };
}

export async function initSqlite() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (Capacitor.getPlatform() === "web") {
      await initWebSqlJsDb();
    } else {
      sqlite = new SQLiteConnection(CapacitorSQLite);
    }
  })();
  return initPromise;
}

export async function getDb(): Promise<DbLike> {
  await initSqlite();

  if (Capacitor.getPlatform() === "web") {
    if (!webDb) throw new Error("Web SQLite (sql.js) not initialized");
    return webDb;
  }

  if (!sqlite) throw new Error("Native SQLite not initialized");

  if (!nativeDb) {
    // Ensure JS/native connection state is consistent
    const consistency = await sqlite.checkConnectionsConsistency();
    if (!consistency.result) {
      await sqlite.closeAllConnections();
    }

    nativeDb = await sqlite.createConnection(
      DB_NAME,
      false,
      "no-encryption",
      DB_VERSION,
      false,
    );
    await nativeDb.open();
  }

  return nativeDb as unknown as DbLike;
}

export async function closeDb() {
  if (Capacitor.getPlatform() === "web") {
    webDb = null;
    return;
  }
  if (!sqlite || !nativeDb) return;
  const dbName = nativeDb.getConnectionDBName();
  const readonly = nativeDb.getConnectionReadOnly();
  await nativeDb.close();
  await sqlite.closeConnection(dbName, readonly);
  nativeDb = null;
}


