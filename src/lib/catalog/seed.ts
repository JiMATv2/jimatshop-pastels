import { getDb } from "../sqlite/sqlite";
import { SEED_PRODUCTS, type ProductSectionKey, type ProductRow } from "./products";

export async function ensureCatalogSchema() {
  const db = await getDb();

  await db.execute(
    `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      unit TEXT NOT NULL,
      image TEXT NOT NULL,
      badge TEXT,
      section TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS products_section_idx ON products (section);
    `,
    true,
  );
}

export async function seedCatalogIfEmpty() {
  await ensureCatalogSchema();
  const db = await getDb();

  const countRes = await db.query(
    `SELECT COUNT(*) as count FROM products;`,
  );
  const count = Number((countRes.values?.[0] as any)?.count ?? 0);
  if (count > 0) return;

  const set = SEED_PRODUCTS.map((p: ProductRow) => ({
    statement: `INSERT INTO products (id, name, price, original_price, unit, image, badge, section)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    values: [
      p.id,
      p.name,
      p.price,
      p.originalPrice ?? null,
      p.unit,
      p.image,
      p.badge ?? null,
      p.section,
    ],
  }));

  await db.executeSet(set, true);
}

export async function getProductsBySection(section: ProductSectionKey) {
  await ensureCatalogSchema();
  const db = await getDb();
  const res = await db.query(
    `SELECT id, name, price, original_price as originalPrice, unit, image, badge
     FROM products
     WHERE section = ?
     ORDER BY id ASC;`,
    [section],
  );
  return (res.values ?? []) as any[];
}


