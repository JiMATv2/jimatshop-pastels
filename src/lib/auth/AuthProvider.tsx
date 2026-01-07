import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session ?? null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    // Handle deep links for OAuth callbacks on mobile
    // Note: The main OAuth flow is handled by mobileAuth.ts during sign-in.
    // This handler is primarily for cold starts (when app is opened via deep link)
    if (Capacitor.isNativePlatform()) {
      const handleAppUrl = async (event: { url: string }) => {
        try {
          const url = new URL(event.url);
          
          // Check if this is an OAuth callback
          // Only process if it's not already being handled by mobileAuth.ts
          // (mobileAuth.ts will handle it during active sign-in flows)
          const isOAuthCallback = 
            url.protocol === "com.jimatbiz.shop3:" ||
            url.hostname === "oauth-callback" ||
            url.searchParams.has("code") ||
            url.hash.includes("access_token");
          
          if (isOAuthCallback) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log("[auth][AuthProvider] Processing OAuth callback from deep link:", event.url);
            }
            
            const hash = url.hash.substring(1);
            const searchParams = url.searchParams;
            
            // Process OAuth callback
            if (hash) {
              const hashParams = new URLSearchParams(hash);
              const accessToken = hashParams.get("access_token");
              const refreshToken = hashParams.get("refresh_token");
              
              if (accessToken && refreshToken) {
                const { data: sessionData, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                if (error) {
                  // eslint-disable-next-line no-console
                  console.error("[auth][AuthProvider] Error setting session from deep link:", error);
                } else if (sessionData.session) {
                  if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log("[auth][AuthProvider] Session set from deep link:", {
                      userId: sessionData.session.user.id,
                      email: sessionData.session.user.email,
                    });
                  }
                }
              }
            } else if (searchParams.has("code")) {
              const code = searchParams.get("code");
              if (code) {
                const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
                
                if (error) {
                  // eslint-disable-next-line no-console
                  console.error("[auth][AuthProvider] Error exchanging code from deep link:", error);
                } else if (sessionData.session) {
                  if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log("[auth][AuthProvider] Session set from code exchange:", {
                      userId: sessionData.session.user.id,
                      email: sessionData.session.user.email,
                    });
                  }
                }
              }
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[auth][AuthProvider] Error handling deep link", e);
        }
      };

      // Listen for app URL opens (when app is opened via deep link)
      const urlListener = App.addListener("appUrlOpen", handleAppUrl);

      // Also check initial URL if app was opened via deep link
      App.getLaunchUrl().then((result) => {
        if (result?.url) {
          handleAppUrl({ url: result.url });
        }
      });

      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
        urlListener.remove();
      };
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("jimatshop_api_token");
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      signOut,
    }),
    [loading, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}


