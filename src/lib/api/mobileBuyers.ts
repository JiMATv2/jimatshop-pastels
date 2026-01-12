import { getMobileProductsClientConfig } from "@/lib/api/mobileProducts";

export type MobileBuyerShop = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  address: string | null;
  shop_photo_url: string | null;
  signboard_photo_url: string | null;
  activate_jimatshop: boolean;
  product_count: number;
  distance_in_km?: number | null; // Distance from current location when latitude/longitude provided
};

export type MobileBuyersListRequest = {
  limit_count?: number;
  offset_count?: number;
  page?: number;
  search_query?: string;
  only_activated?: boolean;
  min_product_count?: number;
  latitude?: number | null; // Optional: current latitude for distance calculation
  longitude?: number | null; // Optional: current longitude for distance calculation
};

export type MobilePaginationInfo = {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  offset: number;
  has_next_page: boolean;
  has_previous_page: boolean;
};

export type MobileBuyersListResponse = {
  success: boolean;
  data: MobileBuyerShop[];
  pagination: MobilePaginationInfo;
  filters: {
    search_query: string;
    only_activated: boolean;
    min_product_count: number;
  };
};

export async function fetchMobileBuyerShops(
  params: MobileBuyersListRequest = {},
): Promise<MobileBuyersListResponse> {
  const cfg = getMobileProductsClientConfig();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/buyers/list`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) || `Failed to fetch buyer shops (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch buyer shops";
    throw new Error(message);
  }

  return json as MobileBuyersListResponse;
}


