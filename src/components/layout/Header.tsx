import { Search, ShoppingCart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getGoogleIdToken } from "@/lib/auth/googleIdentity";
import { getOAuthRedirectUrl, isMobilePlatform, signInWithOAuthMobile } from "@/lib/auth/mobileAuth";
import { supabase } from "@/lib/supabase/client";
import { shopLoginWithGoogleIdToken } from "@/lib/api/jimatshopSession";
import { getCurrentLocation } from "@/lib/geolocation/geolocation";
import { toast } from "@/components/ui/sonner";
import { useCart } from "@/lib/cart/CartProvider";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSavedLocation } from "@/pages/LocationSearch";
import type { SavedLocation } from "@/pages/LocationSearch";
import { useLatestLocation } from "@/lib/location/useLocation";
import { saveCurrentLocation } from "@/lib/location/storage";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { itemCount } = useCart();
  const hasProcessedOAuthLogin = useRef(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { location: sqliteLocation, refresh: refreshLocation } = useLatestLocation();
  const refreshLocationRef = useRef(refreshLocation);
  const [currentLocation, setCurrentLocation] = useState<SavedLocation | null>(
    sqliteLocation || getSavedLocation()
  );
  const [searchValue, setSearchValue] = useState("");

  // Keep ref updated with latest refresh function
  useEffect(() => {
    refreshLocationRef.current = refreshLocation;
  }, [refreshLocation]);

  // Reset flag when user logs out
  useEffect(() => {
    if (!user) {
      hasProcessedOAuthLogin.current = false;
    }
  }, [user]);

  // Update location when SQLite location changes
  useEffect(() => {
    if (sqliteLocation) {
      setCurrentLocation((prev) => {
        // Only update if location actually changed
        if (prev?.coordinates?.latitude === sqliteLocation.coordinates?.latitude &&
            prev?.coordinates?.longitude === sqliteLocation.coordinates?.longitude) {
          return prev;
        }
        return sqliteLocation;
      });
    }
  }, [sqliteLocation]);

  // Update location when returning from location search page
  useEffect(() => {
    // Only refresh if we're coming from location search page
    if (location.pathname === "/location-search") {
      return; // Don't refresh while on the page
    }
    
    // Refresh location when navigating away from location search
    const timer = setTimeout(() => {
      refreshLocationRef.current();
      setCurrentLocation(getSavedLocation());
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]); // Removed refreshLocation from deps

  // Also listen for storage changes (for cross-tab updates)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jimatshop_selected_location") {
        // Clear any pending timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Debounce to prevent rapid updates
        timeoutId = setTimeout(() => {
          refreshLocationRef.current();
          setCurrentLocation(getSavedLocation());
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Empty deps - using ref for refreshLocation

  // Keep search input in sync with URL (?q=...) so it works as a global header across pages.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchValue(q);
  }, [location.pathname, location.search]);

  // Debounced URL updates while you're on the Products page (so typing triggers search there).
  useEffect(() => {
    if (location.pathname !== "/products") return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const currentQ = params.get("q") || "";
      if (currentQ === searchValue) return;

      if (searchValue.trim() === "") params.delete("q");
      else params.set("q", searchValue.trim());

      navigate(
        { pathname: "/products", search: params.toString() ? `?${params.toString()}` : "" },
        { replace: true },
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, navigate, searchValue]);

  // Handle post-OAuth login tasks (when user returns from OAuth redirect)
  useEffect(() => {
    if (loading || !user || hasProcessedOAuthLogin.current) return;

    // Check if this is a new OAuth session (user just signed in via OAuth redirect)
    const processOAuthLogin = async () => {
      try {
        // Link / upsert shopper profile in Supabase (server-side RPC).
        const { error: shopperUpsertError } = await supabase.rpc("upsert_shopper_for_auth_user", {
          first_name:
            (user.user_metadata?.given_name as string | undefined) ||
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            "",
          last_name: (user.user_metadata?.family_name as string | undefined) || null,
          email: user.email || null,
          phone: user.phone || null,
        });
        if (shopperUpsertError) {
          // eslint-disable-next-line no-console
          console.warn("[auth] upsert_shopper_for_auth_user failed", shopperUpsertError);
        }

        // Note: For OAuth redirect flow, we don't have the idToken to exchange
        // for legacy API token. This would need to be handled server-side or
        // via a different mechanism if required.

        // Get user's current geolocation after sign-in
        try {
          const location = await getCurrentLocation();
          // eslint-disable-next-line no-console
          console.log("[auth] User location after sign-in", {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
          });
          
          // Save location to SQLite
          try {
            await saveCurrentLocation(location);
            console.log("[auth] Location saved to SQLite");
            // Refresh location in header
            refreshLocationRef.current();
          } catch (saveError) {
            console.warn("[auth] Failed to save location to SQLite:", saveError);
          }
        } catch (locationError) {
          // Don't block sign-in if geolocation fails
          // eslint-disable-next-line no-console
          console.warn("[auth] Failed to get location after sign-in", locationError);
        }

        hasProcessedOAuthLogin.current = true;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[auth] Failed to process OAuth login", e);
      }
    };

    // Only process if we detect OAuth redirect (check URL hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.has("access_token") || hashParams.has("code")) {
      processOAuthLogin();
    }
  }, [user, loading]);

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      setAuthOpen(false);
      setPassword("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      // eslint-disable-next-line no-console
      console.error("[auth] email sign-in failed", e);
      toast.error(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const onGoogleLogin = async () => {
    setAuthSubmitting(true);
    try {
      // On mobile platforms, skip Google Identity Services (doesn't work well in WebView)
      // and use OAuth redirect with Browser plugin directly
      const isMobile = isMobilePlatform();
      
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[auth] Platform check:", {
          isMobile,
          platform: typeof window !== "undefined" ? (window as any).Capacitor?.getPlatform?.() : "unknown",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
        });
      }
      
      if (isMobile) {
        // eslint-disable-next-line no-console
        console.log("[auth] Using mobile OAuth flow (Browser.open)");
        toast.info("Opening Google sign-in...");
        setAuthOpen(false);
        await signInWithOAuthMobile("google");
        
        // Wait for AuthProvider to update (onAuthStateChange should fire)
        // Poll for session update with timeout
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds total (20 * 100ms)
        let sessionVerified = false;
        
        while (attempts < maxAttempts && !sessionVerified) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          const { data: polledSession, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            // eslint-disable-next-line no-console
            console.error("[auth] Error getting session after OAuth:", sessionError);
            throw new Error("Failed to get session after sign-in");
          }
          
          if (polledSession.session) {
            sessionVerified = true;
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log("[auth] Session verified after OAuth:", {
                userId: polledSession.session.user.id,
                email: polledSession.session.user.email,
                attempts: attempts + 1,
              });
            }
            break;
          }
          
          attempts++;
        }
        
        // Get fresh session after verification
        const { data: finalSession } = await supabase.auth.getSession();
        
        if (!sessionVerified || !finalSession.session) {
          // eslint-disable-next-line no-console
          console.error("[auth] Session not found after OAuth completion (timeout)");
          throw new Error("Sign-in was cancelled or failed - session not set");
        }

        const oauthUser = finalSession.session.user;
        const userEmail = oauthUser.email ?? undefined;
        const userName =
          (oauthUser.user_metadata?.full_name as string | undefined) ||
          (oauthUser.user_metadata?.name as string | undefined) ||
          undefined;

        // Link / upsert shopper profile in Supabase (server-side RPC).
        const { error: shopperUpsertError } = await supabase.rpc("upsert_shopper_for_auth_user", {
          first_name:
            (oauthUser.user_metadata?.given_name as string | undefined) ||
            (oauthUser.user_metadata?.full_name as string | undefined) ||
            (oauthUser.user_metadata?.name as string | undefined) ||
            "",
          last_name: (oauthUser.user_metadata?.family_name as string | undefined) || null,
          email: userEmail || null,
          phone: oauthUser.phone || null,
        });
        if (shopperUpsertError) {
          // eslint-disable-next-line no-console
          console.warn("[auth] upsert_shopper_for_auth_user failed", shopperUpsertError);
        }

        // Get user's current geolocation after sign-in
        try {
          const location = await getCurrentLocation();
          // eslint-disable-next-line no-console
          console.log("[auth] User location after sign-in", {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
          });
          
          // Save location to SQLite
          try {
            await saveCurrentLocation(location);
            console.log("[auth] Location saved to SQLite");
            refreshLocationRef.current();
          } catch (saveError) {
            console.warn("[auth] Failed to save location to SQLite:", saveError);
          }
        } catch (locationError) {
          // eslint-disable-next-line no-console
          console.warn("[auth] Failed to get location after sign-in", locationError);
        }

        toast.success("Signed in");
        return;
      }

      // Web platform: Try Google Identity Services first
      let idToken: string;
      let userEmail: string | undefined;
      let userName: string | undefined;

      try {
        // Try Google Identity Services first (One Tap / button flow)
        setAuthOpen(false);
        idToken = await getGoogleIdToken();
      } catch (gsiError) {
        // If Google Identity Services fails, fall back to Supabase OAuth redirect
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("[auth] Google Identity Services failed, using OAuth redirect fallback", gsiError);
        }

        // Use shared redirect URL logic (prefers localhost/dev current origin)
        const redirectTo = getOAuthRedirectUrl();
        
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("[auth] OAuth redirect URL:", redirectTo);
        }
        
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

        if (oauthError) throw oauthError;

        // OAuth redirect will handle the rest, so we can return early
        toast.info("Redirecting to Google sign-in...");
        return;
      }

      // Continue with id_token flow if Google Identity Services succeeded
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw error;

      userEmail = data.user?.email ?? undefined;
      userName =
        (data.user?.user_metadata?.full_name as string | undefined) ||
        (data.user?.user_metadata?.name as string | undefined) ||
        undefined;

      // Link / upsert shopper profile in Supabase (server-side RPC).
      const { error: shopperUpsertError } = await supabase.rpc("upsert_shopper_for_auth_user", {
        first_name:
          (data.user?.user_metadata?.given_name as string | undefined) ||
          (data.user?.user_metadata?.full_name as string | undefined) ||
          (data.user?.user_metadata?.name as string | undefined) ||
          "",
        last_name: (data.user?.user_metadata?.family_name as string | undefined) || null,
        email: userEmail || null,
        phone: (data.user?.phone as string | undefined) || null,
      });
      if (shopperUpsertError) {
        // eslint-disable-next-line no-console
        console.warn("[auth] upsert_shopper_for_auth_user failed", shopperUpsertError);
      }

      // Optional: exchange Google id_token for legacy API auth token (Phoenix).
      try {
        const apiToken = await shopLoginWithGoogleIdToken({
          idToken,
          email: userEmail,
          name: userName,
        });
        localStorage.setItem("jimatshop_api_token", apiToken);
      } catch {
        // If the API URL isn't configured, skip legacy token exchange.
      }

      // Get user's current geolocation after sign-in
      try {
        const location = await getCurrentLocation();
        // eslint-disable-next-line no-console
        console.log("[auth] User location after sign-in", {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        });
        
        // Save location to SQLite
        try {
          await saveCurrentLocation(location);
          console.log("[auth] Location saved to SQLite");
          refreshLocationRef.current();
        } catch (saveError) {
          console.warn("[auth] Failed to save location to SQLite:", saveError);
        }
      } catch (locationError) {
        // Don't block sign-in if geolocation fails
        // eslint-disable-next-line no-console
        console.warn("[auth] Failed to get location after sign-in", locationError);
      }

      toast.success("Signed in");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      // eslint-disable-next-line no-console
      console.error("[auth] sign-in failed", e);
      toast.error(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const onLogout = async () => {
    try {
      await signOut();
    } finally {
      // Send users back to the splash/login screen after logout.
      navigate("/onboarding?login=1", { replace: true });
    }
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();

    // Preserve buyer_id if present (useful when you're browsing a specific outlet).
    const currentParams = new URLSearchParams(location.search);
    const buyerId = currentParams.get("buyer_id");
    const section = currentParams.get("section") || "featured";

    const params = new URLSearchParams();
    params.set("section", section);
    if (buyerId) params.set("buyer_id", buyerId);
    if (q) params.set("q", q);

    navigate(`/products?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="container mx-auto px-4 py-3">
        {/* Logo and Location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">J</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">JimatShop</h1>
              <Button
                variant="ghost"
                className="h-auto p-0 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/location-search")}
              >
                <MapPin className="w-3 h-3" />
                <span>{currentLocation?.name || "Kuala Lumpur"}</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && !user ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setAuthOpen(true)}>
                  Sign in
                </Button>
                <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Sign in</DialogTitle>
                      <DialogDescription>Use email/password or continue with Google.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={onEmailLogin}>
                      <div className="space-y-2">
                        <Label htmlFor="auth-email">Email</Label>
                        <Input
                          id="auth-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          disabled={authSubmitting}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-password">Password</Label>
                        <Input
                          id="auth-password"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={authSubmitting}
                          required
                        />
                      </div>
                      <Button className="w-full" type="submit" disabled={authSubmitting}>
                        {authSubmitting ? "Signing in..." : "Sign in with email"}
                      </Button>
                    </form>

                    <div className="relative py-2">
                      <Separator />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-background px-2 text-xs text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      type="button"
                      variant="secondary"
                      onClick={onGoogleLogin}
                      disabled={authSubmitting}
                    >
                      Continue with Google
                    </Button>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
            {!loading && user ? (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Logout
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Cart"
              onClick={() => navigate("/checkout")}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <form className="relative" onSubmit={onSubmitSearch}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for groceries..."
            className="pl-10 bg-muted border-0 focus-visible:ring-primary"
            inputMode="search"
            enterKeyHint="search"
            aria-label="Search products"
          />
        </form>
      </div>
    </header>
  );
};
