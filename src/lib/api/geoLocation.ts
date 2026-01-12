export type GeoLocationClientConfig = {
  baseUrl: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

/**
 * Vite env vars:
 * - VITE_EX_SUPABASE_API_URL (optional; defaults to https://ex_supabase.jimatbiz.com)
 */
export function getGeoLocationClientConfig(): GeoLocationClientConfig {
  const baseUrl = normalizeBaseUrl(
    (import.meta.env.VITE_EX_SUPABASE_API_URL as string | undefined) ||
      "https://ex_supabase.jimatbiz.com",
  );

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[geoLocation] config", { baseUrl });
  }

  return { baseUrl };
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | undefined>) {
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error || json.reason)) ||
      `Request failed (HTTP ${res.status})`;
    throw new Error(message);
  }

  return json as T;
}

export type GeoAutocompleteItem = {
  main_text: string;
  secondary_text: string;
  place_id: string;
  city: string;
  area: string;
};

export type GeoLngLat = { lat: number; lng: number };

export type GeoPlaceResult = {
  postcode: string | null;
  area: string | null;
  city: string | null;
  lnglat: GeoLngLat;
};

export type GeoDistanceResponse = {
  distance: { text: string; value: number };
  origin: string[];
  destination: string[];
};

export type GeoOutletItem = {
  id: number | string;
  address: string;
  phone: string | null;
  closing_time: string | null;
  email: string | null;
  name: string | null;
  opening_time: string | null;
  postcode: string | null;
  type: string | null;
  status: string | null;
  map_url: string | null;
  enabled: boolean | null;
  pay_in_store: boolean | null;
  lat?: number | null;
  lng?: number | null;
  distance_in_km: number | null;
};

export type GeoNearbyOutletsResponse = { items: GeoOutletItem[] };

export async function geoAutocomplete(
  input: string,
  cfg: GeoLocationClientConfig = getGeoLocationClientConfig(),
  opts?: { signal?: AbortSignal },
): Promise<GeoAutocompleteItem[]> {
  const url = buildUrl(cfg.baseUrl, "/v2/shop/autocomplete", { input });
  return await fetchJson<GeoAutocompleteItem[]>(url, { method: "GET", signal: opts?.signal });
}

export async function geoPlace(
  placeId: string,
  cfg: GeoLocationClientConfig = getGeoLocationClientConfig(),
  opts?: { signal?: AbortSignal },
): Promise<GeoPlaceResult> {
  const url = buildUrl(cfg.baseUrl, "/v2/shop/place", { place_id: placeId });
  return await fetchJson<GeoPlaceResult>(url, { method: "GET", signal: opts?.signal });
}

/**
 * Direct geocode lookup (returns a raw Google "result" object from the backend).
 * Useful when you need full address_components, etc.
 */
export async function geoGeocodeRaw(
  address: string,
  cfg: GeoLocationClientConfig = getGeoLocationClientConfig(),
  opts?: { signal?: AbortSignal },
): Promise<unknown> {
  const url = buildUrl(cfg.baseUrl, "/v2/shop/geocode", { address });
  return await fetchJson<unknown>(url, { method: "GET", signal: opts?.signal });
}

export async function geoReverseGeocode(
  args: { latitude: number; longitude: number },
  cfg: GeoLocationClientConfig = getGeoLocationClientConfig(),
  opts?: { signal?: AbortSignal },
): Promise<GeoPlaceResult> {
  const url = buildUrl(cfg.baseUrl, "/v2/shop/reverse_geocode", {
    latitude: String(args.latitude),
    longitude: String(args.longitude),
  });
  return await fetchJson<GeoPlaceResult>(url, { method: "GET", signal: opts?.signal });
}

export async function geoCalculateDistance(
  args: { origin: string; destination: string },
  cfg: GeoLocationClientConfig = getGeoLocationClientConfig(),
  opts?: { signal?: AbortSignal },
): Promise<GeoDistanceResponse> {
  const url = buildUrl(cfg.baseUrl, "/v2/shop/calculate_distance", {
    origin: args.origin,
    destination: args.destination,
  });
  return await fetchJson<GeoDistanceResponse>(url, { method: "GET", signal: opts?.signal });
}

/**
 * Finds outlets near the provided coordinates.
 *
 * Backend expects `position` as a JSON string (to stay compatible with the legacy @api endpoint),
 * so we encode it like: {"lat": 3.13, "lng": 101.68}
 */
export async function geoNearbyOutlets(
  args: { lat: number; lng: number; state?: string; km?: number },
  cfg: GeoLocationClientConfig = getGeoLocationClientConfig(),
  opts?: { signal?: AbortSignal },
): Promise<GeoNearbyOutletsResponse> {
  const url = buildUrl(cfg.baseUrl, "/v2/shop/nearby_outlets", {
    position: JSON.stringify({ lat: args.lat, lng: args.lng }),
    state: args.state,
    km: args.km === undefined ? undefined : String(args.km),
  });

  return await fetchJson<GeoNearbyOutletsResponse>(url, { method: "GET", signal: opts?.signal });
}


