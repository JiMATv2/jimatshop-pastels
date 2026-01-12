import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchMobileBuyerShops } from "@/lib/api/mobileBuyers";
import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";
import { MapPin, Navigation } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function formatKm(km: number | null | undefined) {
  if (typeof km !== "number" || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function Shops() {
  const navigate = useNavigate();
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
                          {distance && (
                            <span className="text-xs font-medium text-primary whitespace-nowrap">
                              {distance}
                            </span>
                          )}
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
                      {hasLocation && distance && (
                        <span className="text-xs font-medium text-primary whitespace-nowrap">
                          {distance}
                        </span>
                      )}
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


