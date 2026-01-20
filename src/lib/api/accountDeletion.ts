export type AccountDeletionResponse = {
  success: boolean;
  message?: string;
  error?: string;
  error_code?: string;
};

export type AccountDeletionRequest = {
  email: string;
};

type AccountDeletionClientConfig = {
  baseUrl: string;
  apiToken?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getAccountDeletionClientConfig(): AccountDeletionClientConfig {
  const baseUrl = normalizeBaseUrl(
    import.meta.env.VITE_EX_SUPABASE_API_URL || "https://ex_supabase.jimatbiz.com",
  );
  const apiToken = (import.meta.env.VITE_SUPABASE_API_TOKEN as string | undefined) || undefined;
  return { baseUrl, apiToken };
}

export async function deleteShopperAccount(
  params: AccountDeletionRequest,
  cfg: AccountDeletionClientConfig = getAccountDeletionClientConfig(),
): Promise<AccountDeletionResponse> {
  if (!cfg.apiToken) {
    return {
      success: false,
      message: "VITE_SUPABASE_API_TOKEN is not configured.",
      error: "missing_api_token",
    };
  }

  const res = await fetch(`${cfg.baseUrl}/supabase/shoppers/delete_account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiToken}`,
    },
    body: JSON.stringify({
      email: params.email,
      confirmation: "DELETE_MY_ACCOUNT",
    }),
  });

  const json = (await res.json().catch(() => null)) as AccountDeletionResponse | null;

  if (!res.ok) {
    return {
      success: false,
      message: json?.message || `Failed to delete account (HTTP ${res.status})`,
      error: json?.error || "http_error",
      error_code: json?.error_code,
    };
  }

  return json ?? { success: false, message: "Unexpected response from server" };
}

