import { useQuery } from "@tanstack/react-query";
import { useLatestLocation } from "@/lib/location/useLocation";
import { geoNearbyOutlets } from "@/lib/api/geoLocation";

/**
 * Hook to get buyer IDs from nearby outlets within 20km
 * Returns buyer IDs that can be used to fetch products from nearby buyer inventories
 */
export function useNearbyBuyerIds() {
  const { coordinates, isLoading: locationLoading } = useLatestLocation();

  const { data: buyerIds = [], isLoading, error } = useQuery({
    queryKey: ["nearby-buyer-ids", coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      if (!coordinates?.latitude || !coordinates?.longitude) {
        return [];
      }

      try {
        const response = await geoNearbyOutlets({
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          km: 20, // Limit to 20km as requested
        });

        // Extract buyer IDs from outlet items
        // The outlet id is the buyer_id in the Supabase schema
        const ids = response.items
          .map((item) => {
            // Outlet id can be number or string (UUID)
            return typeof item.id === "string" ? item.id : String(item.id);
          })
          .filter((id) => id && id !== "");

        return ids;
      } catch (err) {
        console.warn("[useNearbyBuyerIds] Failed to fetch nearby outlets:", err);
        return [];
      }
    },
    enabled: Boolean(coordinates?.latitude && coordinates?.longitude),
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    buyerIds,
    isLoading: locationLoading || isLoading,
    error,
    hasLocation: Boolean(coordinates?.latitude && coordinates?.longitude),
  };
}

