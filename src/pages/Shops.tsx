import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchMobileBuyerShops } from "@/lib/api/mobileBuyers";
import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";
import { MapPin, Navigation, Ticket } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-foreground">Buyer Shops</h2>
          <span className="text-xs text-muted-foreground">Browse all shops</span>
        </div>

        {/* Nearby Outlets Section */}
        {hasLocation && (
          <div className="mb-6">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-base font-semibold text-foreground">Nearby Outlets</h3>
              <Link to="/location-search" className="text-xs font-medium text-primary">
                Change location
              </Link>
            </div>

            {locationLoading || nearbyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
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
            ) : nearbyError ? (
              <div className="jimat-card p-4">
                <div className="text-sm text-destructive">Failed to load nearby outlets.</div>
              </div>
            ) : nearbyOutlets.length === 0 ? (
              <div className="jimat-card p-4">
                <div className="text-sm text-muted-foreground">No outlets found within 20 km.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyOutlets.map((outlet) => {
                  const outletId = typeof outlet.id === "string" ? outlet.id : String(outlet.id);
                  const distance = formatKm(outlet.distance_in_km);
                  const name = outlet.name || "Outlet";
                  const hasCoins = buyerIdsWithCoins.has(outletId);
                  return (
                    <button
                      key={outletId}
                      onClick={() => handleShopClick(outletId)}
                      className="w-full text-left jimat-card p-3 flex gap-3 items-center transition-colors hover:bg-muted/50 active:bg-muted"
                    >
                      <div className="h-14 w-14 rounded-xl bg-jimat-green/15 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-6 h-6 text-jimat-darkgreen" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="font-semibold text-foreground truncate">{name}</div>
                          <div className="flex items-center gap-2">
                            {hasCoins ? (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 whitespace-nowrap"
                                aria-label="You have JiMATShop coins at this shop"
                                title="You have JiMATShop coins at this shop"
                              >
                                <Ticket className="w-4 h-4" />
                              </span>
                            ) : null}
                            {distance ? (
                              <span className="text-xs font-medium text-primary whitespace-nowrap">
                                {distance}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {outlet.address || "—"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!hasLocation && (
          <div className="mb-6">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-base font-semibold text-foreground">Nearby Outlets</h3>
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

        {/* All Shops Section */}
        <div className="mb-4">
          <Input
            placeholder="Search shop name / city / state"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
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
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load shops.</p>
        ) : shops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shops found.</p>
        ) : (
          <div className="space-y-3">
            {shops.map((s) => {
              const subtitle = [s.city, s.state].filter(Boolean).join(", ");
              const img = s.shop_photo_url || s.signboard_photo_url || "/placeholder.svg";
              const distance = s.distance_in_km != null ? formatKm(s.distance_in_km) : null;
              const hasCoins = buyerIdsWithCoins.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleShopClick(s.id)}
                  className="w-full text-left jimat-card p-3 flex gap-3 items-center transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <img src={img} alt={s.business_name} className="h-14 w-14 rounded-xl object-cover bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-semibold text-foreground truncate">{s.business_name}</div>
                      <div className="flex items-center gap-2">
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
                      {subtitle || "—"} · {s.product_count} products
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


