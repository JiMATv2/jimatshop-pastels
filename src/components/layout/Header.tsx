import { Search, ShoppingCart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getGoogleIdToken } from "@/lib/auth/googleIdentity";
import { isMobilePlatform, signInWithOAuthMobile } from "@/lib/auth/mobileAuth";
import { supabase } from "@/lib/supabase/client";
import { shopLoginWithGoogleIdToken } from "@/lib/api/jimatshopSession";
import { getCurrentLocation } from "@/lib/geolocation/geolocation";
import { toast } from "@/components/ui/sonner";
import { useEffect, useRef } from "react";

export const Header = () => {
  const { user, loading, signOut } = useAuth();
  const hasProcessedOAuthLogin = useRef(false);

  // Reset flag when user logs out
  useEffect(() => {
    if (!user) {
      hasProcessedOAuthLogin.current = false;
    }
  }, [user]);

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
          // TODO: Store location in user profile or use for location-based features
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

  const onLogin = async () => {
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
        await signInWithOAuthMobile("google");
        
        // Wait for AuthProvider to update (onAuthStateChange should fire)
        // Poll for session update with timeout
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds total (20 * 100ms)
        let sessionVerified = false;
        
        while (attempts < maxAttempts && !sessionVerified) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            // eslint-disable-next-line no-console
            console.error("[auth] Error getting session after OAuth:", sessionError);
            throw new Error("Failed to get session after sign-in");
          }
          
          if (sessionData.session) {
            sessionVerified = true;
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log("[auth] Session verified after OAuth:", {
                userId: sessionData.session.user.id,
                email: sessionData.session.user.email,
                attempts: attempts + 1,
              });
            }
            break;
          }
          
          attempts++;
        }
        
        if (!sessionVerified) {
          // eslint-disable-next-line no-console
          console.error("[auth] Session not found after OAuth completion (timeout)");
          throw new Error("Sign-in was cancelled or failed - session not set");
        }

        const user = sessionData.session.user;
        const userEmail = user.email ?? undefined;
        const userName =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          undefined;

        // Link / upsert shopper profile in Supabase (server-side RPC).
        const { error: shopperUpsertError } = await supabase.rpc("upsert_shopper_for_auth_user", {
          first_name:
            (user.user_metadata?.given_name as string | undefined) ||
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            "",
          last_name: (user.user_metadata?.family_name as string | undefined) || null,
          email: userEmail || null,
          phone: user.phone || null,
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
        idToken = await getGoogleIdToken();
      } catch (gsiError) {
        // If Google Identity Services fails, fall back to Supabase OAuth redirect
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("[auth] Google Identity Services failed, using OAuth redirect fallback", gsiError);
        }

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}${window.location.pathname}`,
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
        // TODO: Store location in user profile or use for location-based features
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
    }
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
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Kuala Lumpur</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && !user ? (
              <Button variant="secondary" size="sm" onClick={onLogin}>
                Sign in
              </Button>
            ) : null}
            {!loading && user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                Logout
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for groceries..."
            className="pl-10 bg-muted border-0 focus-visible:ring-primary"
          />
        </div>
      </div>
    </header>
  );
};
