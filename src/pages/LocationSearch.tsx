import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { 
  getCurrentLocation, 
  type LocationCoordinates,
  checkLocationPermission,
  requestLocationPermission,
  type PermissionStatus
} from "@/lib/geolocation/geolocation";
import { geoAutocomplete, geoNearbyOutlets, geoPlace, type GeoAutocompleteItem } from "@/lib/api/geoLocation";
import { toast } from "@/components/ui/sonner";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { saveCurrentLocation } from "@/lib/location/storage";

export interface SavedLocation {
  name: string;
  coordinates?: LocationCoordinates;
  address?: string;
}

const LOCATION_STORAGE_KEY = "jimatshop_selected_location";

export function getSavedLocation(): SavedLocation | null {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveLocation(location: SavedLocation): void {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

const LocationSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(getSavedLocation());
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("prompt");
  const [autoCompleteResults, setAutoCompleteResults] = useState<GeoAutocompleteItem[]>([]);
  const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);
  const [autoCompleteError, setAutoCompleteError] = useState<string | null>(null);
  const autoCompleteAbortRef = useRef<AbortController | null>(null);

  const runAutocompleteSearch = async (query: string, signal: AbortSignal) => {
    const q = query.trim();
    if (q.length < 3) return;

    setAutoCompleteLoading(true);
    setAutoCompleteError(null);

    try {
      const res = await geoAutocomplete(q, undefined, { signal });
      setAutoCompleteResults(res);
    } catch (e) {
      if (signal.aborted) return;
      const msg = e instanceof Error ? e.message : "Failed to search locations";
      setAutoCompleteError(msg);
      setAutoCompleteResults([]);
    } finally {
      if (!signal.aborted) setAutoCompleteLoading(false);
    }
  };

  useEffect(() => {
    setSavedLocation(getSavedLocation());
    // Check permission status on mount
    checkLocationPermission().then(setPermissionStatus);
  }, []);

  // Debounce location autocomplete (3 seconds after user stops typing)
  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length < 3) {
      setAutoCompleteResults([]);
      setAutoCompleteError(null);
      setAutoCompleteLoading(false);
      if (autoCompleteAbortRef.current) {
        autoCompleteAbortRef.current.abort();
        autoCompleteAbortRef.current = null;
      }
      return;
    }

    const timer = window.setTimeout(() => {
      if (autoCompleteAbortRef.current) autoCompleteAbortRef.current.abort();
      const ac = new AbortController();
      autoCompleteAbortRef.current = ac;
      runAutocompleteSearch(q, ac.signal);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleRequestPermission = async () => {
    try {
      if (permissionStatus === "denied") {
        // If permission is permanently denied, show message (openUrl not available on App plugin)
        toast.error("Location permission denied. Please enable it in your device settings.");
        return;
      }

      toast.info("Requesting location permission...", { duration: 2000 });
      const status = await requestLocationPermission();
      setPermissionStatus(status);
      
      if (status === "granted") {
        toast.success("Location permission granted!", { duration: 2000 });
        // Automatically try to get location after permission is granted
        setTimeout(() => {
          handleUseGeolocation();
        }, 500);
      } else if (status === "denied") {
        toast.error("Location permission denied. Please enable it in app settings.", { duration: 4000 });
      } else {
        toast.warning("Location permission not granted. Please try again.", { duration: 3000 });
      }
    } catch (error) {
      console.error("[location] Failed to request permission", error);
      toast.error("Failed to request location permission. Please try again.");
    }
  };

  const handleUseGeolocation = async () => {
    if (isGettingLocation) return; // Prevent multiple simultaneous requests
    
    setIsGettingLocation(true);
    
    // Monitor app state to detect if app goes to background
    let appStateListener: { remove: () => void } | null = null;
    let wentToBackground = false;

    try {
      // Set up app state listener on mobile platforms
      if (Capacitor.isNativePlatform()) {
        try {
          appStateListener = await CapacitorApp.addListener("appStateChange", ({ isActive }) => {
            if (!isActive) {
              wentToBackground = true;
              // eslint-disable-next-line no-console
              console.warn("[location] App went to background during location request");
            }
          });
        } catch (listenerError) {
          // eslint-disable-next-line no-console
          console.warn("[location] Failed to set up app state listener", listenerError);
        }
      }

      // Show initial toast
      toast.info("Getting your location...", { duration: 2000 });

      // Small delay to ensure UI is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check permission status first
      const currentPermissionStatus = await checkLocationPermission();
      setPermissionStatus(currentPermissionStatus);
      
      if (currentPermissionStatus !== "granted") {
        // Request permission explicitly
        toast.info("Location permission required. Please grant permission to use GPS.", { duration: 3000 });
        const requestedStatus = await requestLocationPermission();
        setPermissionStatus(requestedStatus);
        
        if (requestedStatus !== "granted") {
          throw new Error("Location permission denied. Please grant location permission to use GPS location.");
        }
      }

      // Request location - try network location first (more reliable, less likely to crash)
      // Network location uses WiFi/cell towers and is faster and more stable
      // If it fails, getCurrentLocation will automatically try high accuracy GPS
      const location = await getCurrentLocation({
        enableHighAccuracy: false, // Start with network location (more reliable)
        timeout: 60000, // Increased timeout to 60 seconds for emulators/slower devices
        maximumAge: 60000, // Accept cached location up to 1 minute old
        requestPermission: false, // We already requested permission above
      });

      // Remove app state listener
      if (appStateListener) {
        try {
          appStateListener.remove();
        } catch (e) {
          // Ignore errors removing listener
        }
      }

      if (wentToBackground) {
        toast.warning("App went to background during location request. Please try again.");
        setIsGettingLocation(false);
        return;
      }

      // Validate location data
      if (!location || typeof location.latitude !== "number" || typeof location.longitude !== "number") {
        throw new Error("Invalid location data received");
      }

      // Save location to SQLite
      try {
        await saveCurrentLocation(location);
        console.log("[location] Location saved to SQLite");
      } catch (sqliteError) {
        console.warn("[location] Failed to save location to SQLite:", sqliteError);
        // Continue with localStorage save even if SQLite fails
      }

      // Fetch nearby outlets using the location coordinates
      try {
        console.log("[location] Fetching nearby outlets for coordinates:", {
          lat: location.latitude,
          lng: location.longitude,
        });
        
        const nearbyOutlets = await geoNearbyOutlets({
          lat: location.latitude,
          lng: location.longitude,
          km: 10, // Search within 10km radius
        });
        
        console.log("[location] Nearby outlets found:", nearbyOutlets);
        
        if (nearbyOutlets.items && nearbyOutlets.items.length > 0) {
          console.log(`[location] Found ${nearbyOutlets.items.length} nearby outlet(s)`);
          // You can use this data to display outlets or filter products by location
        } else {
          console.log("[location] No nearby outlets found");
        }
      } catch (outletError) {
        // Don't fail the location save if outlet fetch fails
        console.warn("[location] Failed to fetch nearby outlets:", outletError);
        // Continue with saving location even if outlet fetch fails
      }

      // Reverse geocode to get address name (simplified - in production, use a geocoding API)
      // For now, we'll use coordinates and let user enter a name
      const newLocation: SavedLocation = {
        name: "Current Location",
        coordinates: location,
        address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      };

      saveLocation(newLocation);
      setSavedLocation(newLocation);
      toast.success("Location set successfully");
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error) {
      // Remove listener on error
      if (appStateListener) {
        try {
          appStateListener.remove();
        } catch (e) {
          // Ignore errors removing listener
        }
      }
      
      let errorMessage = "Failed to get location";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Provide user-friendly error messages
      if (errorMessage.includes("timeout")) {
        toast.error("Location request timed out. Please ensure location services are enabled and try again.");
      } else if (errorMessage.includes("permission")) {
        toast.error("Location permission denied. Please enable location permissions in app settings.");
      } else if (errorMessage.includes("unavailable") || errorMessage.includes("not available")) {
        toast.error("Location services are unavailable. Please check your device settings.");
      } else if (errorMessage.includes("invalid")) {
        toast.error("Invalid location data received. Please try again.");
      } else {
        toast.error(`Failed to get location: ${errorMessage}`);
      }
      
      // eslint-disable-next-line no-console
      console.error("[location] Failed to get geolocation", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmitSearch = () => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      toast.error("Please enter at least 3 characters to search");
      return;
    }

    if (autoCompleteAbortRef.current) autoCompleteAbortRef.current.abort();
    const ac = new AbortController();
    autoCompleteAbortRef.current = ac;
    runAutocompleteSearch(q, ac.signal);
  };

  const handleSelectSavedLocation = (location: SavedLocation) => {
    saveLocation(location);
    setSavedLocation(location);
    toast.success(`Location set to "${location.name}"`);
    navigate(-1);
  };

  const handleSelectAutocomplete = async (item: GeoAutocompleteItem) => {
    try {
      const place = await geoPlace(item.place_id);
      const coords = place.lnglat;
      if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
        throw new Error("Invalid coordinates returned by place lookup");
      }

      const newLocation: SavedLocation = {
        name:_attachName(item),
        address: [item.main_text, item.secondary_text].filter(Boolean).join(", "),
        coordinates: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
      };

      // Persist to SQLite so the rest of the app (useLatestLocation) picks it up as the current location.
      await saveCurrentLocation({
        latitude: coords.lat,
        longitude: coords.lng,
      });

      saveLocation(newLocation);
      setSavedLocation(newLocation);
      toast.success(`Location set to "${newLocation.name}"`);
      navigate(-1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to set location";
      toast.error(msg);
    }
  };

  function _attachName(item: GeoAutocompleteItem) {
    // Prefer a short user-friendly label
    if (item.area && item.city) return `${item.area}, ${item.city}`;
    if (item.main_text) return item.main_text;
    return item.secondary_text || "Selected Location";
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-4">
      <Header />

      <main className="px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Select Location</h1>
          <p className="text-sm text-muted-foreground">
            Choose your delivery location to see available products and shops
          </p>
        </div>

        {/* Current Location */}
        {savedLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{savedLocation.name}</p>
                  {savedLocation.address && (
                    <p className="text-sm text-muted-foreground">{savedLocation.address}</p>
                  )}
                  {savedLocation.coordinates && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {savedLocation.coordinates.latitude.toFixed(6)},{" "}
                      {savedLocation.coordinates.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Use GPS Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Use Current Location</CardTitle>
            <CardDescription>
              {permissionStatus === "granted" 
                ? "Get your location using GPS"
                : permissionStatus === "denied"
                ? "Location permission is denied. Please enable it in app settings."
                : "Location permission is required to use GPS"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {permissionStatus !== "granted" && (
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={handleRequestPermission}
              >
                <MapPin className="h-4 w-4" />
                {permissionStatus === "denied" 
                  ? "Open App Settings"
                  : "Grant Location Permission"}
              </Button>
            )}
            <Button
              className="w-full gap-2"
              onClick={handleUseGeolocation}
              disabled={isGettingLocation || permissionStatus === "denied"}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Use GPS Location
                </>
              )}
            </Button>
            {permissionStatus === "denied" && (
              <p className="text-xs text-muted-foreground text-center">
                Location permission is permanently denied. Please enable it in your device settings.
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Search Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Location</CardTitle>
            <CardDescription>Enter a location name or address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter location name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitSearch();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSubmitSearch}
                disabled={searchQuery.trim().length < 3 || autoCompleteLoading}
              >
                {autoCompleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Common Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Results</CardTitle>
            <CardDescription>
              {autoCompleteLoading
                ? "Searching…"
                : autoCompleteError
                ? "Search failed"
                : autoCompleteResults.length > 0
                ? "Select a location below"
                : "Search or type 3+ characters"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {autoCompleteError ? (
              <div className="text-sm text-destructive">{autoCompleteError}</div>
            ) : autoCompleteLoading ? (
              <div className="text-sm text-muted-foreground">Searching locations…</div>
            ) : autoCompleteResults.length === 0 ? (
              <div className="text-sm text-muted-foreground">No results.</div>
            ) : (
              autoCompleteResults.slice(0, 8).map((item) => (
                <div
                  key={item.place_id}
                  className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-3"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.main_text}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.area, item.city, item.secondary_text].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleSelectAutocomplete(item)}>
                    Set
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default LocationSearch;

