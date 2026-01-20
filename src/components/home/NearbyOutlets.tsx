import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { useMemo, useState } from "react";
function formatKm(km: number | null | undefined) {
  if (typeof km !== "number" || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function NearbyOutlets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coordinates, isLoading: locationLoading } = useLatestLocation();
  const [isOpen, setIsOpen] = useState(false);

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
      <details
        className="group"
        open={isOpen}
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
      >
        <summary className="flex items-baseline justify-between gap-3 mb-3 cursor-pointer list-none">
          <h3 className="text-lg font-semibold text-foreground">Nearby Outlets</h3>
          <div className="flex items-center gap-3">
            <Link
              to="/location-search"
              className="text-xs font-medium text-primary"
              onClick={(event) => event.stopPropagation()}
            >
              Change location
            </Link>
            <button
              type="button"
              className="text-xs font-medium text-primary"
              onClick={(event) => {
                event.preventDefault();
                setIsOpen((prev) => !prev);
              }}
            >
              {isOpen ? "Collapse" : "Expand"}
            </button>
          </div>
        </summary>

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
              const address = o.address || "—";
              const hasCoins = buyerIdsWithCoins.has(outletId);
              return (
                <button
                  key={outletId}
                  onClick={() => navigate(`/products?buyer_id=${outletId}`)}
                  className="w-full text-left jimat-card p-0 overflow-hidden transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <div className="p-4 grid grid-cols-4 md:grid-cols-12 items-center">
                    <div className="col-span-1 md:col-span-2 flex justify-center">
                      <div className="h-20 w-20 rounded-xl bg-jimat-green/15 flex items-center justify-center text-jimat-darkgreen">
                        <img
                          src="https://jimatshop.com/images/icons/store.svg"
                          alt="Store"
                          className="h-12 w-12"
                        />
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-10 ml-2 md:ml-3 min-w-0">
                      <h5 className="text-sm font-semibold text-foreground leading-5 truncate">
                        {name}
                      </h5>
                      <p className="py-1 text-xs text-muted-foreground leading-tight truncate">
                        {address}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {hasCoins ? (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                            aria-label="You have JiMATShop coins at this shop"
                            title="You have JiMATShop coins at this shop"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            Coins
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded bg-jimat-green/15 px-2.5 py-0.5 text-xs font-medium text-jimat-darkgreen">
                            Open
                          </span>
                        )}
                        {distance ? <span>{distance}</span> : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </details>
      {!isOpen &&
      hasLocation &&
      !locationLoading &&
      !isLoading &&
      !isError &&
      items.length > 0 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {items.slice(0, 4).map((o) => {
            const outletId = typeof o.id === "string" ? o.id : String(o.id);
            const name = o.name || "Outlet";
            return (
              <button
                key={`preview-${outletId}`}
                onClick={() => navigate(`/products?buyer_id=${outletId}`)}
                className="jimat-card p-2 text-left transition-colors hover:bg-muted/50 active:bg-muted"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 w-10 rounded-lg bg-jimat-green/15 flex items-center justify-center">
                    <img
                      src="https://jimatshop.com/images/icons/store.svg"
                      alt="Store"
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="text-[10px] font-medium text-foreground text-center line-clamp-2">
                    {name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
      <Link
        to="/shops"
        className="mt-3 block w-full jimat-card p-3 text-center text-sm font-medium text-primary transition-colors hover:bg-muted/50 active:bg-muted"
      >
        View all outlets
      </Link>
    </section>
  );
}


