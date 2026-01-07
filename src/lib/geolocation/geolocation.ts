import { Geolocation } from "@capacitor/geolocation";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

/**
 * Gets the user's current geolocation.
 * On Android, this requires location permissions to be granted.
 *
 * @returns Promise resolving to location coordinates
 * @throws Error if geolocation is unavailable or permission is denied
 */
export async function getCurrentLocation(): Promise<LocationCoordinates> {
  try {
    // Check if permissions are available
    const permissionStatus = await Geolocation.checkPermissions();
    
    if (permissionStatus.location !== "granted") {
      // Request permissions
      const requestResult = await Geolocation.requestPermissions();
      
      if (requestResult.location !== "granted") {
        throw new Error("Location permission denied");
      }
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude ?? null,
      altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
      heading: position.coords.heading ?? null,
      speed: position.coords.speed ?? null,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[geolocation] Failed to get current location", error);
    throw error;
  }
}

/**
 * Watches the user's geolocation and calls the callback with updates.
 * Returns a function to stop watching.
 *
 * @param callback Function called with location updates
 * @returns Function to stop watching location
 */
export async function watchLocation(
  callback: (location: LocationCoordinates) => void,
): Promise<() => void> {
  let watchId: string | null = null;

  try {
    const permissionStatus = await Geolocation.checkPermissions();
    
    if (permissionStatus.location !== "granted") {
      const result = await Geolocation.requestPermissions();
      if (result.location !== "granted") {
        throw new Error("Location permission denied");
      }
    }

    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
      (position) => {
        if (position) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? null,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
            heading: position.coords.heading ?? null,
            speed: position.coords.speed ?? null,
          });
        }
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[geolocation] Failed to watch location", error);
  }

  return () => {
    if (watchId) {
      Geolocation.clearWatch({ id: watchId });
      watchId = null;
    }
  };
}

