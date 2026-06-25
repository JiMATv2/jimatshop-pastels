export type ProductBadge = "sale" | "new" | "fast";
export type ProductSectionKey = "featured" | "popular";

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  unit: string;
  image: string;
  badge?: ProductBadge | null;
  section: ProductSectionKey;
}

// The seed catalog is intentionally empty. Products are sourced from the live API
// and nearby buyer inventories; no mock/demo products are shipped with the app.
export const SEED_PRODUCTS: ProductRow[] = [];


