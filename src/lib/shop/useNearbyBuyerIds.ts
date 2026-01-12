import { useQuery } from "@tanstack/react-query";
import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets, type GeoOutletItem } from "@/lib/api/geoLocation";

/**
 * Hook to get buyer IDs from nearby outlets within 20km
 * Returns buyer IDs that can be used to fetch products from nearby buyer inventories
 */
export function useNearbyBuyerIds() {
  const { coordinates, isLoading: locationLoading } = useLatestLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["nearby-buyer-ids", coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      if (!coordinates?.latitude || !coordinates?.longitude) {
        return { buyerIds: [] as string[], outlets: [] as GeoOutletItem[] };
      }

      try {
        const response = await geoNearbyOutlets({
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          km: 20, // Limit to 20km as requested
        });

        console.debug("[useNearbyBuyerIds] Nearby outlets response:", response.items.length, "outlets");

        // Extract buyer IDs from outlet items
        // The outlet id is the buyer_id in the Supabase schema
        const ids = response.items
          .map((item) => {
            // Outlet id can be number or string (UUID)
            return typeof item.id === "string" ? item.id : String(item.id);
          })
          .filter((id) => id && id !== "");

        console.debug("[useNearbyBuyerIds] Extracted buyer IDs:", ids.length, "buyers");
        console.debug("[useNearbyBuyerIds] Buyer IDs:", ids);
        
        // Check for duplicate buyer IDs
        const uniqueIds = Array.from(new Set(ids));
        if (uniqueIds.length !== ids.length) {
          console.warn("[useNearbyBuyerIds] WARNING: Duplicate buyer IDs detected!", {
            total: ids.length,
            unique: uniqueIds.length,
          });
        }

        return { buyerIds: uniqueIds, outlets: response.items };
      } catch (err) {
        console.warn("[useNearbyBuyerIds] Failed to fetch nearby outlets:", err);
        return { buyerIds: [] as string[], outlets: [] as GeoOutletItem[] };
      }
    },
    enabled: Boolean(coordinates?.latitude && coordinates?.longitude),
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    buyerIds: data?.buyerIds ?? [],
    outlets: data?.outlets ?? [],
    isLoading: locationLoading || isLoading,
    error,
    hasLocation: Boolean(coordinates?.latitude && coordinates?.longitude),
  };
}

