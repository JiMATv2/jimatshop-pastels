export interface MobileProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  normal_price: number;
  promotion_price: number | null;
  stock_level: number;
  cover_image_url: string;
  seller_id: string;
  seller_name: string;
  products_sold: number;
  total_orders: number;
  unique_buyers: number;
  is_fast_moving: boolean;
  is_featured: boolean;
  fast_moving_rank_seller: number | null;
  fast_moving_rank_platform: number | null;
  discount_percentage: number;
  semantic_similarity: number | null;
  brand_id: string | null;
  brand_name: string | null;
}

export interface MobilePaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  offset: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export interface MobileProductsResponse {
  success: boolean;
  data: MobileProduct[];
  pagination: MobilePaginationInfo;
  filters: {
    search_query: string;
    category: string;
    subcategory: string;
    brand: string;
    buyer_city: string | null;
    use_semantic_search: boolean;
  };
}

export interface MobileProductsRequest {
  limit_count?: number;
  offset_count?: number;
  page?: number;
  search_query?: string;
  category_filter?: string;
  subcategory_filter?: string;
  brand_filter?: string;
  buyer_city?: string | null;
  use_semantic_search?: boolean;
  semantic_threshold?: number;
  // ex_supabase extension: choose data source
  source?: "marketplace" | "buyer_inventory";
  // when source="buyer_inventory"
  buyer_id?: string | null;
  buyer_user_id?: string | null;
  auto_import_from_orders?: boolean;
}

export type MobileProductsClientConfig = {
  baseUrl: string;
  apiToken?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

/**
 * Vite env vars:
 * - VITE_EX_SUPABASE_API_URL (optional; defaults to https://ex_supabase.jimatbiz.com)
 * - VITE_SUPABASE_API_TOKEN (optional; if missing we can fall back to local seed catalog)
 */
export function getMobileProductsClientConfig(): MobileProductsClientConfig {
  const baseUrl = normalizeBaseUrl(
    import.meta.env.VITE_EX_SUPABASE_API_URL || "https://ex_supabase.jimatbiz.com",
  );
  const apiToken = import.meta.env.VITE_SUPABASE_API_TOKEN as string || "jimat_supabase_secret_2025_changeme";

  // Helpful for debugging config issues without leaking the actual token.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[mobileProducts] config", {
      baseUrl,
      hasToken: Boolean(apiToken),
      tokenLength: apiToken?.length ?? 0,
      allEnvKeys: Object.keys(import.meta.env).filter((k) => k.startsWith("VITE_")),
    });
  }
  return { baseUrl, apiToken };
}

export async function fetchMobileProducts(
  params: MobileProductsRequest = {},
  cfg: MobileProductsClientConfig = getMobileProductsClientConfig(),
): Promise<MobileProductsResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/products/list`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Failed to fetch products (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch products";
    throw new Error(message);
  }

  return json as MobileProductsResponse;
}


