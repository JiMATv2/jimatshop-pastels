import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase/client";

/**
 * Check if we're running on a mobile platform (Android/iOS)
 */
export function isMobilePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the redirect URL for OAuth based on the platform
 * For mobile: Use web redirect URI that Google accepts, then redirect to deep link
 */
export function getOAuthRedirectUrl(): string {
  if (isMobilePlatform()) {
    // For mobile apps, use Supabase's web callback URL
    // This is registered in Google Cloud Console as a web redirect URI
    // Supabase will then redirect to our deep link via redirect_to parameter
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (supabaseUrl) {
      // Use Supabase callback URL - this must be registered in Google Cloud Console
      // Format: https://your-project.supabase.co/auth/v1/callback
      return `${supabaseUrl}/auth/v1/callback`;
    }
    // Fallback: use deep link (won't work for web OAuth flows)
    return "com.jimatbiz.shop3://oauth-callback";
  }
  // For web:
  // - Prefer the current origin/path for localhost + dev to avoid accidentally
  //   redirecting to production domains (e.g. v2.jimatbiz.com) from a local build.
  // - In production, prefer the configured app URL if provided.
  const currentUrl = `${window.location.origin}${window.location.pathname}`;
  const appUrl = import.meta.env.VITE_APP_URL as string | undefined;
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (import.meta.env.DEV || isLocalhost) return currentUrl;
  return appUrl || currentUrl;
}

/**
 * Get the deep link URL for mobile OAuth callback
 */
export function getDeepLinkUrl(): string {
  return "com.jimatbiz.shop3://oauth-callback";
}

/**
 * Sign in with OAuth on mobile platforms using Capacitor Browser
 * Note: Uses Supabase's Google OAuth client configuration, not Android client ID
 */
export async function signInWithOAuthMobile(provider: "google" | "apple" = "google"): Promise<void> {
  if (!isMobilePlatform()) {
    throw new Error("signInWithOAuthMobile should only be called on mobile platforms");
  }

  const redirectTo = getOAuthRedirectUrl();
  
  // Start OAuth flow - Supabase uses its own Google OAuth client configuration
  // The Android client ID (VITE_GOOGLE_CLIENT_ID_ANDROID) is not needed here
  // because Supabase handles the OAuth with its configured Google OAuth client
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true, // We'll handle the redirect manually
      // Use PKCE flow for better mobile security
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[auth][mobileAuth] OAuth error", error);
    throw error;
  }
  if (!data.url) throw new Error("OAuth URL not returned");

  // Modify the OAuth URL
  // For mobile WebView OAuth, we need to use a web redirect URI that Google accepts
  // The redirect_to parameter tells Supabase where to redirect after OAuth completes
  const oauthUrl = new URL(data.url);
  
  // Set redirect_to to our deep link - Supabase will redirect there after OAuth
  const deepLinkUrl = getDeepLinkUrl();
  oauthUrl.searchParams.set("redirect_to", deepLinkUrl);
  
  // The redirect_uri should already be set to Supabase's callback URL by Supabase
  // This is a web URL that Google accepts (must be registered in Google Cloud Console)
  // We don't need to modify redirect_uri - Supabase handles it correctly
  
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[auth][mobileAuth] OAuth URL redirect_to:", deepLinkUrl);
    // eslint-disable-next-line no-console
    console.log("[auth][mobileAuth] OAuth URL redirect_uri:", oauthUrl.searchParams.get("redirect_uri"));
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[auth][mobileAuth] OAuth URL:", oauthUrl.toString());
    // eslint-disable-next-line no-console
    console.log("[auth][mobileAuth] Redirect URL:", redirectTo);
  }

  // Set up listener for deep link callback BEFORE opening browser
  let urlListener: any;
  let browserFinishedListener: any;
  const urlPromise = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (urlListener) urlListener.remove();
      if (browserFinishedListener) browserFinishedListener.remove();
      reject(new Error("OAuth flow timed out. Please try again."));
    }, 300000); // 5 minutes timeout

    // Listen for app URL opens (deep links)
    urlListener = App.addListener("appUrlOpen", async (event) => {
      try {
        const url = new URL(event.url);
        
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("[auth][mobileAuth] appUrlOpen received:", event.url);
        }
        
        // Check if this is our OAuth callback (deep link)
        const isDeepLink = url.protocol === "com.jimatbiz.shop3:" || url.hostname === "oauth-callback";
        const hasOAuthParams = url.searchParams.has("code") || url.hash.includes("access_token");
        
        if (isDeepLink || hasOAuthParams) {
          clearTimeout(timeout);
          
          // Close the browser if it's still open
          try {
            await Browser.close();
          } catch (e) {
            // Browser might already be closed, ignore
          }
          
          // Extract the URL fragment/query params and process them
          const hash = url.hash.substring(1);
          const searchParams = url.searchParams;
          
          // Process the OAuth callback
          if (hash) {
            const hashParams = new URLSearchParams(hash);
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            
            if (accessToken && refreshToken) {
              // Set the session manually
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                urlListener.remove();
                if (browserFinishedListener) browserFinishedListener.remove();
                reject(sessionError);
                return;
              }
              
              // Verify session was set
              if (!sessionData.session) {
                urlListener.remove();
                if (browserFinishedListener) browserFinishedListener.remove();
                reject(new Error("Session was not set after OAuth callback"));
                return;
              }
              
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log("[auth][mobileAuth] Session set successfully:", {
                  userId: sessionData.session.user.id,
                  email: sessionData.session.user.email,
                });
              }
              
              // Wait a moment for onAuthStateChange to fire and update AuthProvider
              // This ensures the session state is propagated before we resolve
              await new Promise((resolve) => setTimeout(resolve, 100));
              
              // Verify session is still set (double-check)
              const { data: verifySession } = await supabase.auth.getSession();
              if (!verifySession.session) {
                urlListener.remove();
                if (browserFinishedListener) browserFinishedListener.remove();
                reject(new Error("Session verification failed after setting"));
                return;
              }
              
              urlListener.remove();
              if (browserFinishedListener) browserFinishedListener.remove();
              resolve();
              return;
            }
          }
          
          // Also check query params (some OAuth flows use query params)
          const code = searchParams.get("code");
          if (code) {
            // Exchange code for session
            const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              urlListener.remove();
              if (browserFinishedListener) browserFinishedListener.remove();
              reject(exchangeError);
              return;
            }
            
            // Verify session was set
            if (!sessionData.session) {
              urlListener.remove();
              if (browserFinishedListener) browserFinishedListener.remove();
              reject(new Error("Session was not set after code exchange"));
              return;
            }
            
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log("[auth][mobileAuth] Session set via code exchange:", {
                userId: sessionData.session.user.id,
                email: sessionData.session.user.email,
              });
            }
            
            // Wait a moment for onAuthStateChange to fire and update AuthProvider
            await new Promise((resolve) => setTimeout(resolve, 100));
            
            // Verify session is still set (double-check)
            const { data: verifySession } = await supabase.auth.getSession();
            if (!verifySession.session) {
              urlListener.remove();
              if (browserFinishedListener) browserFinishedListener.remove();
              reject(new Error("Session verification failed after code exchange"));
              return;
            }
            
            urlListener.remove();
            if (browserFinishedListener) browserFinishedListener.remove();
            resolve();
            return;
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[auth][mobileAuth] Error processing appUrlOpen", e);
      }
    });

    // Also listen for browser finished event as fallback
    browserFinishedListener = Browser.addListener("browserFinished", async () => {
      // Check if we have a session (user might have completed OAuth)
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          clearTimeout(timeout);
          urlListener.remove();
          browserFinishedListener.remove();
          resolve();
        }
      } catch (e) {
        // Session check failed, continue waiting
      }
    });
  });

  // Open the OAuth URL in Capacitor Browser
  // This should open in the system browser, not the WebView
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[auth][mobileAuth] Opening browser with URL:", oauthUrl.toString());
  }
  
  // Open in system browser (not WebView)
  // Remove windowName to ensure it opens in external browser
  await Browser.open({
    url: oauthUrl.toString(),
  });
  
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[auth][mobileAuth] Browser opened, waiting for callback...");
  }

  // Wait for the callback
  await urlPromise;
}

