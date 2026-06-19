import { Search, LogOut, MessageSquare } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getGoogleIdToken } from "@/lib/auth/googleIdentity";
import { isMobilePlatform, signInWithGoogleNative } from "@/lib/auth/mobileAuth";
import { supabase } from "@/lib/supabase/client";
import { shopLoginWithGoogleIdToken } from "@/lib/api/jimatshopSession";
import { getCurrentLocation } from "@/lib/geolocation/geolocation";
import { toast } from "@/components/ui/sonner";
import { CartIconButton } from "@/components/cart/CartIconButton";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveCurrentLocation } from "@/lib/location/storage";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { getTotalUnreadCount } = useChatContext();
  const unread = getTotalUnreadCount();
  const hasProcessedOAuthLogin = useRef(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Reset flag when user logs out
  useEffect(() => {
    if (!user) {
      hasProcessedOAuthLogin.current = false;
    }
  }, [user]);

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
        console.log("[auth] Using native Google Sign-In (GoogleAuth plugin)");
        toast.info("Opening Google sign-in...");
        setAuthOpen(false);

        const { userId, email, name } = await signInWithGoogleNative();

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("[auth] Native Google sign-in complete", { userId, email });
        }

        // Link / upsert shopper profile via ex_supabase RPC.
        const { data: freshSession } = await supabase.auth.getSession();
        const oauthUser = freshSession.session?.user;
        const { error: shopperUpsertError } = await supabase.rpc("upsert_shopper_for_auth_user", {
          first_name:
            (oauthUser?.user_metadata?.given_name as string | undefined) ||
            (oauthUser?.user_metadata?.full_name as string | undefined) ||
            (oauthUser?.user_metadata?.name as string | undefined) ||
            name ||
            "",
          last_name: (oauthUser?.user_metadata?.family_name as string | undefined) || null,
          email: email || oauthUser?.email || null,
          phone: oauthUser?.phone || null,
        });
        if (shopperUpsertError) {
          // eslint-disable-next-line no-console
          console.warn("[auth] upsert_shopper_for_auth_user failed", shopperUpsertError);
        }

        // Best-effort location capture – never block the sign-in UX.
        try {
          const location = await getCurrentLocation();
          // eslint-disable-next-line no-console
          console.log("[auth] User location after sign-in", {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
          });
          try {
            await saveCurrentLocation(location);
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
        // If Google Identity Services fails, provide clear feedback
        const isUnregisteredOrigin = gsiError instanceof Error && gsiError.message.includes("unregistered_origin");
        if (isUnregisteredOrigin) {
          toast.error("Google Sign-In Error: Domain/Origin not registered. Please add 'http://localhost:8082' to your Google Cloud Console JavaScript origins.");
          throw gsiError;
        }

        // No redirect-flow fallback as ex_supabase backend doesn't support it
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("[auth] Google Identity Services failed", gsiError);
        }
        throw gsiError;
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
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : (() => {
                try {
                  return JSON.stringify(e);
                } catch {
                  return "Sign-in failed";
                }
              })();
      // eslint-disable-next-line no-console
      console.error("[auth] sign-in failed:", msg, e);
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
    <StickyHeader as="header">
      <div className="container mx-auto px-4 py-3 safe-area-x md:max-w-5xl md:flex md:items-center md:gap-4">
        {/* Header Actions */}
        <div className="flex items-center justify-end mb-3 px-4 md:mb-0 md:px-0 md:shrink-0 md:order-2">
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
              <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Chat"
              onClick={() => navigate("/chat")}
            >
              <MessageSquare className="w-5 h-5" />
              {unread > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Button>
            <CartIconButton aria-label="Cart" />
          </div>
        </div>

        {/* Search Bar */}
        <form className="relative md:flex-1" onSubmit={onSubmitSearch}>
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
    </StickyHeader>
  );
};
