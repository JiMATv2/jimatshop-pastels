import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

function formatKm(km: number | null | undefined) {
  if (typeof km !== "number" || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function NearbyOutlets() {
  const { coordinates, isLoading: locationLoading } = useLatestLocation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["nearby-outlets", coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      if (!coordinates) throw new Error("Missing coordinates");
      return await geoNearbyOutlets({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        km: 10,
      });
    },
    enabled: Boolean(coordinates?.latitude && coordinates?.longitude),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const hasLocation = Boolean(coordinates?.latitude && coordinates?.longitude);

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
          <div className="text-sm text-muted-foreground">No outlets found within 10 km.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 6).map((o) => {
            const distance = formatKm(o.distance_in_km);
            const name = o.name || "Outlet";
            return (
              <div key={String(o.id)} className="jimat-card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-jimat-green/15 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-jimat-darkgreen" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-foreground truncate">{name}</div>
                      {distance ? (
                        <span className="text-xs font-medium text-primary whitespace-nowrap">
                          {distance}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {o.address || "—"}
                    </div>
                    {o.map_url ? (
                      <a
                        href={o.map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-xs font-medium text-primary"
                      >
                        Open in Maps
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}


