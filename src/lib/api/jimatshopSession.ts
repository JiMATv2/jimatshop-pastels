type ShopLoginResponse = {
  data?: { token?: string };
  message?: string;
  error?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getJimatshopApiBaseUrl() {
  return normalizeBaseUrl(
    (import.meta.env.VITE_JIMATSHOP_API_URL as string | undefined) ||
      (import.meta.env.VITE_API_URL as string | undefined) ||
      "",
  );
}

export async function shopLoginWithGoogleIdToken(args: {
  idToken: string;
  email?: string;
  name?: string;
}): Promise<string> {
  const baseUrl = getJimatshopApiBaseUrl();
  if (!baseUrl) {
    throw new Error("Missing VITE_JIMATSHOP_API_URL (or VITE_API_URL) for backend session exchange");
  }

  const res = await fetch(`${baseUrl}/v2/shop/authentication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_token: args.idToken,
      email: args.email,
      name: args.name,
    }),
  });

  const json = (await res.json().catch(() => null)) as ShopLoginResponse | null;

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) || `Shop login failed (HTTP ${res.status})`;
    throw new Error(message);
  }

  const token = json?.data?.token;
  if (!token) throw new Error("Shop login succeeded but token is missing in response");
  return token;
}


