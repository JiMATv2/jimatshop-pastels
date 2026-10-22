import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchMobileBuyerShops } from "@/lib/api/mobileBuyers";
import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";
import { MapPin, MessageSquare, Navigation, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";

function formatKm(km: number | null | undefined) {
  if (typeof km !== "number" || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function Shops() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const search = useMemo(() => q.trim(), [q]);
  const { coordinates, isLoading: locationLoading } = useLatestLocation();
  
  const handleShopClick = (buyerId: string) => {
    navigate(`/products?buyer_id=${buyerId}`);
  };

  // Fetch nearby outlets
  const { data: nearbyData, isLoading: nearbyLoading, isError: nearbyError } = useQuery({
    queryKey: ["nearby-outlets", coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      if (!coordinates) throw new Error("Missing coordinates");
      return await geoNearbyOutlets({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        km: 20,
      });
    },
    enabled: Boolean(coordinates?.latitude && coordinates?.longitude),
    staleTime: 60_000,
  });

  const nearbyOutlets = nearbyData?.items ?? [];
  const hasLocation = Boolean(coordinates?.latitude && coordinates?.longitude);

  // Fetch regular shops with distance if location is available
  const { data, isLoading, error } = useQuery({
    queryKey: ["mobile-buyer-shops", search, coordinates?.latitude, coordinates?.longitude],
    queryFn: async () =>
      fetchMobileBuyerShops({
        page: 1,
        limit_count: 50,
        search_query: search,
        only_activated: false,
        min_product_count: 1,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
      }),
    staleTime: 60_000,
  });

  const shops = data?.data ?? [];

  const mergedShops = useMemo(() => {
    const byId = new Map<
      string,
      {
        id: string;
        name: string;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        email?: string | null;
        contact_name?: string | null;
        distance_in_km?: number | null;
        product_count?: number | null;
        shop_photo_url?: string | null;
        signboard_photo_url?: string | null;
      }
    >();

    for (const s of shops) {
      if (!s.id) continue;
      byId.set(String(s.id), {
        id: String(s.id),
        name: s.business_name || s.outlet_name || "Outlet",
        address: s.address ?? null,
        city: s.city ?? null,
        state: s.state ?? null,
        email: s.email ?? null,
        contact_name: s.contact_name ?? null,
        distance_in_km: typeof s.distance_in_km === "number" ? s.distance_in_km : null,
        product_count: typeof s.product_count === "number" ? s.product_count : 0,
        shop_photo_url: s.shop_photo_url ?? null,
        signboard_photo_url: s.signboard_photo_url ?? null,
      });
    }

    for (const outlet of nearbyOutlets) {
      const outletId = typeof outlet.id === "string" ? outlet.id : String(outlet.id);
      if (!outletId) continue;
      const existing = byId.get(outletId);
      const distance = typeof outlet.distance_in_km === "number" ? outlet.distance_in_km : null;
      const name = outlet.name || existing?.name || "Outlet";
      const address = outlet.address ?? existing?.address ?? null;
      const email = outlet.email ?? existing?.email ?? null;
      if (existing) {
        byId.set(outletId, {
          ...existing,
          name,
          address,
          email,
          distance_in_km: distance ?? existing.distance_in_km ?? null,
        });
      } else {
        byId.set(outletId, {
          id: outletId,
          name,
          address,
          email,
          distance_in_km: distance,
          product_count: 0,
        });
      }
    }

    let list = Array.from(byId.values());

    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          (item.city && item.city.toLowerCase().includes(lower)) ||
          (item.state && item.state.toLowerCase().includes(lower)) ||
          (item.address && item.address.toLowerCase().includes(lower)) ||
          (item.email && item.email.toLowerCase().includes(lower)) ||
          (item.contact_name && item.contact_name.toLowerCase().includes(lower)),
      );
    }

    list.sort((a, b) => {
      const da = typeof a.distance_in_km === "number" ? a.distance_in_km : Number.POSITIVE_INFINITY;
      const db = typeof b.distance_in_km === "number" ? b.distance_in_km : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [nearbyOutlets, shops, search]);

  const displayedBuyerIds = useMemo(() => {
    const ids: string[] = [];
    for (const o of nearbyOutlets) {
      const id = typeof o.id === "string" ? o.id : String(o.id);
      if (id) ids.push(id);
    }
    for (const s of shops) {
      if (s.id) ids.push(s.id);
    }
    return Array.from(new Set(ids));
  }, [nearbyOutlets, shops]);

  const { data: shopperId } = useQuery({
    queryKey: ["shops-shopper-id", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return await resolveShopperId({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const { data: buyerIdsWithCoins = new Set<string>() } = useQuery({
    queryKey: ["shops-buyer-ids-with-coins", shopperId ?? null, displayedBuyerIds.join(",")],
    queryFn: async () => {
      if (!shopperId) return new Set<string>();
      if (displayedBuyerIds.length === 0) return new Set<string>();

      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("buyer_id,balance")
        .eq("shopper_id", shopperId)
        .in("buyer_id", displayedBuyerIds);

      if (error) throw error;

      const ids = new Set<string>();
      for (const row of (data as any[]) ?? []) {
        const buyerId = (row as any)?.buyer_id;
        const raw = (row as any)?.balance;
        const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;
        if (buyerId && Number.isFinite(n) && n > 0) ids.add(String(buyerId));
      }
      return ids;
    },
    enabled: Boolean(shopperId) && displayedBuyerIds.length > 0,
    staleTime: 15_000,
  });

  const { data: buyerIdsWithPromo = new Set<string>() } = useQuery({
    queryKey: ["shops-buyer-ids-with-promo", displayedBuyerIds.join(",")],
    queryFn: async () => {
      if (displayedBuyerIds.length === 0) return new Set<string>();

      const today = new Date().toISOString().slice(0, 10);
      const { data: campaigns, error: campaignError } = await supabase
        .from("jimatshop_campaigns")
        .select("id")
        .lte("start_date", today)
        .gte("end_date", today);

      if (campaignError) throw campaignError;

      const campaignIds = (campaigns as Array<{ id: string }> | null)
        ?.map((campaign) => campaign.id)
        .filter(Boolean);

      if (!campaignIds || campaignIds.length === 0) return new Set<string>();

      const { data: campaignBuyers, error: buyerError } = await supabase
        .from("campaign_buyers")
        .select("buyer_id")
        .in("campaign_id", campaignIds)
        .in("buyer_id", displayedBuyerIds);

      if (buyerError) throw buyerError;

      const ids = new Set<string>();
      for (const row of (campaignBuyers as Array<{ buyer_id: string }> | null) ?? []) {
        if (row?.buyer_id) ids.add(String(row.buyer_id));
      }
      return ids;
    },
    enabled: displayedBuyerIds.length > 0,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4 max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-foreground">Buyer Shops</h2>
          <span className="text-xs text-muted-foreground">Browse all shops</span>
        </div>

        {!hasLocation && (
          <div className="mb-6">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-base font-semibold text-foreground">Location</h3>
              <Link to="/location-search" className="text-xs font-medium text-primary">
                Set location
              </Link>
            </div>
            <div className="jimat-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-jimat-pastelblue/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-jimat-darkgreen" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">Location not set</div>
                  <div className="text-xs text-muted-foreground">
                    Set your location to see the nearest outlets.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <Input
            placeholder="Search outlet name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {locationLoading || nearbyLoading || isLoading ? (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="jimat-card p-3 flex gap-3 items-center">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error || nearbyError ? (
          <p className="text-sm text-destructive">Failed to load shops.</p>
        ) : mergedShops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shops found.</p>
        ) : (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {mergedShops.map((s) => {
              const subtitle = s.address || [s.city, s.state].filter(Boolean).join(", ");
              const img = s.shop_photo_url || s.signboard_photo_url || null;
              const distance = formatKm(s.distance_in_km ?? null);
              const hasCoins = buyerIdsWithCoins.has(s.id);
              const hasPromo = buyerIdsWithPromo.has(s.id);
              return (
                <div
                  key={s.id}
                  className="w-full jimat-card p-3 flex gap-3 items-center"
                >
                <button
                  type="button"
                  onClick={() => handleShopClick(s.id)}
                  className="flex-1 text-left flex gap-3 items-center min-w-0 transition-colors hover:opacity-90"
                >
                  {img ? (
                    <img src={img} alt={s.name} className="h-14 w-14 rounded-xl object-cover bg-muted" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-jimat-green/15 flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-6 h-6 text-jimat-darkgreen" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-semibold text-foreground truncate">{s.name}</div>
                      <div className="flex items-center gap-2">
                        {hasPromo ? (
                          <span className="inline-flex items-center rounded bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700 whitespace-nowrap">
                            PROMO
                          </span>
                        ) : null}
                        {hasCoins ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 whitespace-nowrap"
                            aria-label="You have JiMATShop coins at this shop"
                            title="You have JiMATShop coins at this shop"
                          >
                            <Ticket className="w-4 h-4" />
                          </span>
                        ) : null}
                        {hasLocation && distance ? (
                          <span className="text-xs font-medium text-primary whitespace-nowrap">
                            {distance}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {subtitle || "—"} · {s.product_count ?? 0} products
                    </div>
                  </div>
                </button>
                {user ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Message ${s.name}`}
                    onClick={() => navigate(`/chat?buyer_id=${encodeURIComponent(s.id)}`)}
                  >
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </Button>
                ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


