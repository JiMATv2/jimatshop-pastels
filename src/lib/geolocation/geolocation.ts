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

export type PermissionStatus = "granted" | "denied" | "prompt" | "prompt-with-rationale";

/**
 * Checks the current location permission status.
 * @returns Promise resolving to the permission status
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    const status = await Geolocation.checkPermissions();
    return status.location as PermissionStatus;
  } catch (error) {
    console.error("[geolocation] Failed to check permissions", error);
    return "denied";
  }
}

/**
 * Explicitly requests location permissions from the user.
 * Shows the system permission dialog.
 * @returns Promise resolving to the permission status after request
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    console.log("[geolocation] Requesting location permission...");
    const result = await Geolocation.requestPermissions();
    const status = result.location as PermissionStatus;
    console.log("[geolocation] Permission request result:", status);
    return status;
  } catch (error) {
    console.error("[geolocation] Failed to request permissions", error);
    return "denied";
  }
}

/**
 * Gets the user's current geolocation.
 * On Android, this requires location permissions to be granted.
 *
 * @param options Optional configuration for location request
 * @returns Promise resolving to location coordinates
 * @throws Error if geolocation is unavailable or permission is denied
 */
export async function getCurrentLocation(
  options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    requestPermission?: boolean; // Whether to request permission if not granted
  }
): Promise<LocationCoordinates> {
  try {
    // Check if permissions are available
    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus !== "granted") {
      // Request permissions if requested or if status is prompt
      if (options?.requestPermission !== false && (permissionStatus === "prompt" || permissionStatus === "prompt-with-rationale")) {
        const requestResult = await requestLocationPermission();
        
        if (requestResult !== "granted") {
          throw new Error("Location permission denied. Please grant location permission to use GPS location.");
        }
      } else if (permissionStatus === "denied") {
        throw new Error("Location permission denied. Please enable location permissions in app settings.");
      } else {
        throw new Error("Location permission not granted. Please grant location permission to use GPS location.");
      }
    }

    // Use simpler, more reliable options to avoid crashes
    // Start with lower accuracy first (more reliable, faster)
    // Then optionally try high accuracy if requested
    const useHighAccuracy = options?.enableHighAccuracy ?? false;
    const timeout = options?.timeout ?? 60000; // Increased to 60 seconds for emulators
    
    const locationOptions = {
      enableHighAccuracy: useHighAccuracy,
      timeout: timeout,
      maximumAge: options?.maximumAge ?? 60000, // Accept cached location up to 1 minute old
    };

    // eslint-disable-next-line no-console
    console.log("[geolocation] Requesting location with options:", locationOptions);

    try {
      // Get current position
      const position = await Geolocation.getCurrentPosition(locationOptions);

      if (!position || !position.coords) {
        throw new Error("Invalid location data received");
      }

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? null,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
        heading: position.coords.heading ?? null,
        speed: position.coords.speed ?? null,
      };
    } catch (firstError) {
      // If network-based location fails and we're not already using high accuracy,
      // try with high accuracy GPS as a fallback (especially useful for emulators)
      if (!useHighAccuracy && firstError instanceof Error && firstError.message.toLowerCase().includes("timeout")) {
        console.log("[geolocation] Network location timed out, trying high accuracy GPS...");
        
        try {
          const highAccuracyOptions = {
            enableHighAccuracy: true,
            timeout: timeout,
            maximumAge: 0, // Don't use cached location for GPS
          };
          
          const position = await Geolocation.getCurrentPosition(highAccuracyOptions);
          
          if (!position || !position.coords) {
            throw new Error("Invalid location data received");
          }

          return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? null,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
            heading: position.coords.heading ?? null,
            speed: position.coords.speed ?? null,
          };
        } catch (secondError) {
          // If high accuracy also fails, throw the original error
          throw firstError;
        }
      }
      
      // Re-throw the original error if fallback wasn't attempted or also failed
      throw firstError;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[geolocation] Failed to get current location", error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("timeout")) {
        throw new Error("Location request timed out. If you're using an emulator, please set a location in the emulator settings. On a real device, ensure location services are enabled.");
      }
      if (errorMsg.includes("permission")) {
        throw new Error("Location permission denied. Please enable location permissions in app settings.");
      }
      if (errorMsg.includes("unavailable") || errorMsg.includes("not available")) {
        throw new Error("Location services are unavailable. Please check your device settings.");
      }
      if (errorMsg.includes("invalid")) {
        throw new Error("Invalid location data received. Please try again.");
      }
    }
    
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

