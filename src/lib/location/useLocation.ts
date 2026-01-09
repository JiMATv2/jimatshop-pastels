import { useEffect, useState, useCallback } from "react";
import { getLatestLocation, historicalLocationToCoordinates, type HistoricalLocation } from "./storage";
import { getSavedLocation, type SavedLocation } from "@/pages/LocationSearch";
import type { LocationCoordinates } from "../geolocation/geolocation";

/**
 * Hook to get the latest saved location from SQLite
 * Falls back to localStorage if SQLite doesn't have a location
 */
export function useLatestLocation(): {
  location: SavedLocation | null;
  coordinates: LocationCoordinates | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try SQLite first
      const historicalLocation = await getLatestLocation();
      
      if (historicalLocation) {
        const coordinates = historicalLocationToCoordinates(historicalLocation);
        const savedLocation: SavedLocation = {
          name: "Current Location",
          coordinates: coordinates,
          address: `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
        };
        
        // Check if location actually changed before updating state
        setLocation((prev) => {
          if (prev?.coordinates?.latitude === coordinates.latitude && 
              prev?.coordinates?.longitude === coordinates.longitude) {
            return prev; // No change, return previous to avoid re-render
          }
          return savedLocation;
        });
        
        // Also sync to localStorage for backward compatibility (without triggering storage event)
        const localStorageLocation = getSavedLocation();
        if (!localStorageLocation || 
            localStorageLocation.coordinates?.latitude !== coordinates.latitude ||
            localStorageLocation.coordinates?.longitude !== coordinates.longitude) {
          // Use a flag to prevent storage event from triggering refresh
          // We'll update localStorage but skip the event listener
          const currentValue = localStorage.getItem("jimatshop_selected_location");
          const newValue = JSON.stringify(savedLocation);
          if (currentValue !== newValue) {
            // Temporarily remove listener, update, then re-add (handled in Header)
            localStorage.setItem("jimatshop_selected_location", newValue);
          }
        }
      } else {
        // Fallback to localStorage if SQLite is empty
        const localStorageLocation = getSavedLocation();
        setLocation((prev) => {
          // Only update if different
          if (prev?.name === localStorageLocation?.name &&
              prev?.coordinates?.latitude === localStorageLocation?.coordinates?.latitude &&
              prev?.coordinates?.longitude === localStorageLocation?.coordinates?.longitude) {
            return prev;
          }
          return localStorageLocation;
        });
      }
    } catch (error) {
      console.warn("[useLatestLocation] Failed to load from SQLite, falling back to localStorage:", error);
      // Fallback to localStorage on error
      const localStorageLocation = getSavedLocation();
      setLocation((prev) => {
        if (prev?.name === localStorageLocation?.name &&
            prev?.coordinates?.latitude === localStorageLocation?.coordinates?.latitude &&
            prev?.coordinates?.longitude === localStorageLocation?.coordinates?.longitude) {
          return prev;
        }
        return localStorageLocation;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  return {
    location,
    coordinates: location?.coordinates ?? null,
    isLoading,
    refresh: loadLocation,
  };
}

