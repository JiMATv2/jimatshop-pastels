import { getMobileProductsClientConfig, type MobileProductsClientConfig } from "./mobileProducts";

export type JimatshopCampaign = {
  id: string;
  title: string;
  subtitle?: string | null;
  cover_image_url?: string | null;
  start_date: string;
  end_date: string;
};

export type CampaignInventory = {
  inventory_id: string;
  product_id: string;
  product_name: string;
  cover_image_url: string;
  stock_level: number;
  retail_price: number;
  promo_price: number;
  normal_price: number | null;
  buyer_id: string;
  buyer_name: string;
  buyer_address?: string | null;
};

export type CampaignListResponse = {
  success: boolean;
  data: JimatshopCampaign[];
  pagination?: {
    total_count: number;
    limit: number;
    offset: number;
    has_next_page: boolean;
  };
  error?: string;
  message?: string;
};

export type CampaignInventoryResponse = {
  success: boolean;
  data: CampaignInventory[];
  pagination?: {
    total_count: number;
    limit: number;
    offset: number;
    has_next_page: boolean;
  };
  error?: string;
  message?: string;
};

export type CampaignListRequest = {
  status?: "active" | "upcoming" | "ended" | "all";
  limit_count?: number;
  offset_count?: number;
  campaign_id?: string;
};

export async function fetchJimatshopCampaigns(
  params: CampaignListRequest = {},
  cfg: MobileProductsClientConfig = getMobileProductsClientConfig(),
): Promise<CampaignListResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/campaigns/list`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Failed to fetch campaigns (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch campaigns";
    throw new Error(message);
  }

  return json as CampaignListResponse;
}

export async function fetchCampaignInventories(
  campaignId: string,
  params: { limit_count?: number; offset_count?: number } = {},
  cfg: MobileProductsClientConfig = getMobileProductsClientConfig(),
): Promise<CampaignInventoryResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cfg.apiToken) {
    headers["Authorization"] = `Bearer ${cfg.apiToken}`;
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/campaigns/inventories`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      campaign_id: campaignId,
      ...params,
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Failed to fetch campaign inventories (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (json && json.success === false) {
    const message = (json.message || json.error) ?? "Failed to fetch campaign inventories";
    throw new Error(message);
  }

  return json as CampaignInventoryResponse;
}

