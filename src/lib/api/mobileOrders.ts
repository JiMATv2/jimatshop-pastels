export type MobileOrdersClientConfig = {
  baseUrl: string;
  apiToken?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

/**
 * Vite env vars:
 * - VITE_EX_SUPABASE_API_URL (optional; defaults to https://ex_supabase.jimatbiz.com)
 * - VITE_SUPABASE_API_TOKEN (required for checkout)
 */
export function getMobileOrdersClientConfig(): MobileOrdersClientConfig {
  const baseUrl = normalizeBaseUrl(
    import.meta.env.VITE_EX_SUPABASE_API_URL || "https://ex_supabase.jimatbiz.com",
  );
  const apiToken = import.meta.env.VITE_SUPABASE_API_TOKEN as string | undefined;

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[mobileOrders] config", { baseUrl, hasToken: Boolean(apiToken) });
  }

  return { baseUrl, apiToken };
}

export type MobileCreateJimatshopOrderItem = {
  product_id: string;
  quantity: number;
};

export type MobileCreateJimatshopOrderRequest = {
  buyer_id: string;
  shopper_id: string;
  items: MobileCreateJimatshopOrderItem[];
  shipping_address?: Record<string, unknown> | null;
  notes?: string | null;
  payment_method?: "pay_in_store" | "jimatshop_coins" | "billplz";
};

export type MobileCreateJimatshopOrderResponse =
  | {
      success: true;
      data: {
        jimatshop_order_id: string;
        items_count: number;
        total_amount: number;
        status: string;
        billplz_url?: string | null;
      };
    }
  | {
      success: false;
      error: string;
      message?: string;
    };

export async function createMobileJimatshopOrder(
  body: MobileCreateJimatshopOrderRequest,
  cfg: MobileOrdersClientConfig = getMobileOrdersClientConfig(),
): Promise<MobileCreateJimatshopOrderResponse> {
  if (!cfg.apiToken) {
    return { success: false, error: "missing_api_token", message: "VITE_SUPABASE_API_TOKEN is not configured" };
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/mobile/orders/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiToken}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as MobileCreateJimatshopOrderResponse | null;

  if (!res.ok) {
    return (
      json ?? {
        success: false,
        error: "http_error",
        message: `Checkout failed (HTTP ${res.status})`,
      }
    );
  }

  return (json ?? { success: false, error: "invalid_response" }) as MobileCreateJimatshopOrderResponse;
}


