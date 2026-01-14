import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { useMemo } from "react";
function formatKm(km: number | null | undefined) {
  if (typeof km !== "number" || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function NearbyOutlets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coordinates, isLoading: locationLoading } = useLatestLocation();

  const { data, isLoading, isError } = useQuery({
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

  const items = data?.items ?? [];
  const hasLocation = Boolean(coordinates?.latitude && coordinates?.longitude);

  const displayedBuyerIds = useMemo(() => {
    const ids: string[] = [];
    for (const o of items) {
      const id = typeof o.id === "string" ? o.id : String(o.id);
      if (id) ids.push(id);
    }
    return Array.from(new Set(ids));
  }, [items]);

  const { data: shopperId } = useQuery({
    queryKey: ["nearby-outlets-shopper-id", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return await resolveShopperId({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const { data: buyerIdsWithCoins = new Set<string>() } = useQuery({
    queryKey: ["nearby-outlets-buyer-ids-with-coins", shopperId ?? null, displayedBuyerIds.join(",")],
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
    <section className="px-4 py-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground">Nearby Outlets</h3>
        <Link to="/location-search" className="text-xs font-medium text-primary">
          Change location
        </Link>
      </div>

      {!hasLocation ? (
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
      ) : locationLoading || isLoading ? (
        <div className="jimat-card p-4">
          <div className="text-sm text-muted-foreground">Finding outlets near you…</div>
        </div>
      ) : isError ? (
        <div className="jimat-card p-4">
          <div className="text-sm text-destructive">Failed to load nearby outlets.</div>
          <div className="text-xs text-muted-foreground mt-1">
            Please try again or update your location.
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="jimat-card p-4">
          <div className="text-sm text-muted-foreground">No outlets found within 20 km.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 6).map((o) => {
            const outletId = typeof o.id === "string" ? o.id : String(o.id);
            const distance = formatKm(o.distance_in_km);
            const name = o.name || "Outlet";
            const hasCoins = buyerIdsWithCoins.has(outletId);
            return (
              <button
                key={outletId}
                onClick={() => navigate(`/products?buyer_id=${outletId}`)}
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
                    {o.address || "—"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}


