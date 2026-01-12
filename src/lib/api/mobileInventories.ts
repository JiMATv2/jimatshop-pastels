import { getMobileProductsClientConfig, type MobileProductsClientConfig } from "./mobileProducts";

// Product listing (grouped by product_id)
export type MobileProduct = {
  product_id: string;
  product_name: string;
  cover_image_url: string;
  retail_price: number;
  outlets_with_stock: number;
  total_outlets: number;
  total_quantity_sold: number;
  total_orders: number;
  unique_shoppers: number;
};

// Inventory item (specific buyer's inventory for a product)
export type MobileInventory = {
  inventory_id: string;
  product_id: string;
  product_name: string;
  cover_image_url: string;
  stock_level: number;
  retail_price: number;
  buyer_id: string;
  buyer_name: string;
  buyer_address?: string;
  total_quantity_sold: number;
  total_orders: number;
};

function toNumber(v: unknown, fallback: number = 0): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProduct(raw: any): MobileProduct {
  return {
    product_id: String(raw?.product_id ?? ""),
    product_name: String(raw?.product_name ?? ""),
    cover_image_url: String(raw?.cover_image_url ?? ""),
    retail_price: toNumber(raw?.retail_price, 0),
    outlets_with_stock: toNumber(raw?.outlets_with_stock, 0),
    total_outlets: toNumber(raw?.total_outlets, 0),
    total_quantity_sold: toNumber(raw?.total_quantity_sold, 0),
    total_orders: toNumber(raw?.total_orders, 0),
    unique_shoppers: toNumber(raw?.unique_shoppers, 0),
  };
}

function normalizeInventory(raw: any): MobileInventory {
  return {
    inventory_id: String(raw?.inventory_id ?? ""),
    product_id: String(raw?.product_id ?? ""),
    product_name: String(raw?.product_name ?? ""),
    cover_image_url: String(raw?.cover_image_url ?? ""),
    stock_level: toNumber(raw?.stock_level, 0),
    retail_price: toNumber(raw?.retail_price, 0),
    buyer_id: String(raw?.buyer_id ?? ""),
    buyer_name: String(raw?.buyer_name ?? ""),
    buyer_address: raw?.buyer_address ? String(raw.buyer_address) : undefined,
    total_quantity_sold: toNumber(raw?.total_quantity_sold, 0),
    total_orders: toNumber(raw?.total_orders, 0),
  };
}

export type MobileInventoryPaginationInfo = {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  offset: number;
  has_next_page: boolean;
  has_previous_page: boolean;
};

export type MobileProductsResponse = {
  success: boolean;
  data: MobileProduct[];
  pagination: MobileInventoryPaginationInfo;
  error?: string;
  message?: string;
};

export type MobileInventoriesResponse = {
  success: boolean;
  data: MobileInventory[];
  error?: string;
  message?: string;
};

export type MobileInventoriesRequest = {
  limit_count?: number;
  offset_count?: number;
  page?: number;
  search_query?: string;
  product_id?: string;
  buyer_ids?: string[];
  buyer_user_id?: string | null;
};

export type MobileInventoryDetailsResponse = {
  success: boolean;
  data: MobileInventory;
  error?: string;
  message?: string;
};

export async function fetchMobileInventories(
  params: MobileInventoriesRequest,
  cfg: MobileProductsClientConfig = getMobileProductsClientConfig(),
): Promise<MobileProductsResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/inventories/list`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Failed to fetch inventories (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch inventories";
    throw new Error(message);
  }

  const resp = json as MobileProductsResponse;
  return {
    ...resp,
    data: Array.isArray(resp?.data) ? resp.data.map(normalizeProduct) : [],
  };
}

export async function fetchInventoriesForProduct(
  productId: string,
  buyerIds?: string[],
  cfg: MobileProductsClientConfig = getMobileProductsClientConfig(),
): Promise<MobileInventoriesResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/inventories/by-product`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      product_id: productId,
      buyer_ids: buyerIds || [],
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Failed to fetch inventories (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch inventories";
    throw new Error(message);
  }

  const resp = json as MobileInventoriesResponse;
  return {
    ...resp,
    data: Array.isArray(resp?.data) ? resp.data.map(normalizeInventory) : [],
  };
}

export async function fetchMobileInventoryById(
  inventoryId: string,
  cfg: MobileProductsClientConfig = getMobileProductsClientConfig(),
): Promise<MobileInventoryDetailsResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/inventory/${inventoryId}`, {
    method: "GET",
    headers,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Failed to fetch inventory (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch inventory";
    throw new Error(message);
  }

  const resp = json as MobileInventoryDetailsResponse;
  return {
    ...resp,
    data: normalizeInventory((resp as any)?.data),
  };
}


