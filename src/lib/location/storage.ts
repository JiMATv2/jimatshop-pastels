import { getDb } from "../sqlite/sqlite";
import type { LocationCoordinates } from "../geolocation/geolocation";

export interface HistoricalLocation {
  id: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  created_at: string;
}

/**
 * Ensures the historical_current_location table exists
 */
export async function ensureLocationSchema() {
  const db = await getDb();

  await db.execute(
    `
    CREATE TABLE IF NOT EXISTS historical_current_location (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      altitude REAL,
      altitude_accuracy REAL,
      heading REAL,
      speed REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS historical_location_created_at_idx ON historical_current_location (created_at DESC);
    `,
    true,
  );
}

/**
 * Saves the current location to SQLite
 */
export async function saveCurrentLocation(
  coordinates: LocationCoordinates,
): Promise<HistoricalLocation> {
  await ensureLocationSchema();
  const db = await getDb();

  const result = await db.run(
    `INSERT INTO historical_current_location 
     (latitude, longitude, accuracy, altitude, altitude_accuracy, heading, speed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      coordinates.latitude,
      coordinates.longitude,
      coordinates.accuracy ?? null,
      coordinates.altitude ?? null,
      coordinates.altitudeAccuracy ?? null,
      coordinates.heading ?? null,
      coordinates.speed ?? null,
    ],
    true,
  );

  // Fetch the inserted record.
  // Note: some adapters (e.g. sql.js on web) don't return `changes.lastId`.
  // Fall back to SQLite's last_insert_rowid() and then to "latest row".
  let insertedId = result.changes?.lastId;
  if (!insertedId) {
    try {
      const idRes = await db.query("select last_insert_rowid() as id;");
      const row = (idRes.values?.[0] as any) ?? null;
      const idVal = row?.id;
      const parsed =
        typeof idVal === "number"
          ? idVal
          : typeof idVal === "string"
            ? Number.parseInt(idVal, 10)
            : null;
      if (parsed && Number.isFinite(parsed)) insertedId = parsed;
    } catch {
      // ignore and try final fallback below
    }
  }

  if (!insertedId) {
    try {
      const latest = await db.query(
        "select id from historical_current_location order by created_at desc limit 1;",
      );
      const row = (latest.values?.[0] as any) ?? null;
      const idVal = row?.id;
      const parsed =
        typeof idVal === "number"
          ? idVal
          : typeof idVal === "string"
            ? Number.parseInt(idVal, 10)
            : null;
      if (parsed && Number.isFinite(parsed)) insertedId = parsed;
    } catch {
      // ignore
    }
  }

  if (!insertedId) throw new Error("Failed to save location: no ID returned");

  const location = await getLocationById(insertedId);
  if (!location) {
    throw new Error("Failed to retrieve saved location");
  }

  return location;
}

/**
 * Gets the latest saved location from SQLite
 */
export async function getLatestLocation(): Promise<HistoricalLocation | null> {
  await ensureLocationSchema();
  const db = await getDb();

  const result = await db.query(
    `SELECT id, latitude, longitude, accuracy, altitude, altitude_accuracy as altitudeAccuracy, 
            heading, speed, created_at as createdAt
     FROM historical_current_location
     ORDER BY created_at DESC
     LIMIT 1`,
  );

  const values = result.values ?? [];
  if (values.length === 0) {
    return null;
  }

  const row = values[0] as any;
  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy ?? null,
    altitude: row.altitude ?? null,
    altitudeAccuracy: row.altitudeAccuracy ?? null,
    heading: row.heading ?? null,
    speed: row.speed ?? null,
    created_at: row.createdAt,
  };
}

/**
 * Gets a location by ID
 */
async function getLocationById(id: number): Promise<HistoricalLocation | null> {
  const db = await getDb();

  const result = await db.query(
    `SELECT id, latitude, longitude, accuracy, altitude, altitude_accuracy as altitudeAccuracy, 
            heading, speed, created_at as createdAt
     FROM historical_current_location
     WHERE id = ?`,
    [id],
  );

  const values = result.values ?? [];
  if (values.length === 0) {
    return null;
  }

  const row = values[0] as any;
  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy ?? null,
    altitude: row.altitude ?? null,
    altitudeAccuracy: row.altitudeAccuracy ?? null,
    heading: row.heading ?? null,
    speed: row.speed ?? null,
    created_at: row.createdAt,
  }
}

/**
 * Converts HistoricalLocation to LocationCoordinates
 */
export function historicalLocationToCoordinates(
  location: HistoricalLocation,
): LocationCoordinates {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy ?? undefined,
    altitude: location.altitude ?? undefined,
    altitudeAccuracy: location.altitudeAccuracy ?? undefined,
    heading: location.heading ?? undefined,
    speed: location.speed ?? undefined,
  };
}

