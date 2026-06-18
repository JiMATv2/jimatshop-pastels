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
 * Safely stringify an error-like value for logs so we never end up with
 * `[object Object]` in the Android logcat.
 */
function describeError(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Native Google Sign-In for Capacitor (Android/iOS).
 *
 * Uses @codetrix-studio/capacitor-google-auth to get a Google id_token, then
 * exchanges it for a session via the ex_supabase backend through
 * `supabase.auth.signInWithIdToken` (which POSTs `/supabase/auth/google`).
 *
 * This replaces the Supabase OAuth redirect flow (`signInWithOAuthMobile`),
 * which the ex_supabase backend does not support.
 */
export async function signInWithGoogleNative(): Promise<{
  userId: string;
  email: string | null;
  name: string | null;
}> {
  if (!isMobilePlatform()) {
    throw new Error("signInWithGoogleNative should only be called on mobile platforms");
  }

  const webClientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ||
    "552393042714-oioegtu0b4rntqj2ol015jm86va9jaoj.apps.googleusercontent.com";

  const iosClientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS as string | undefined) ||
    "552393042714-cjtit54f5qogspi1q6544gh7m2s8t9lk.apps.googleusercontent.com";

  const platformClientId = Capacitor.getPlatform() === "ios" ? iosClientId : webClientId;

  // Dynamic import so web builds don't pull in the native plugin shim.
  const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");

  try {
    // Safe to call multiple times – plugin is idempotent.
    await GoogleAuth.initialize({
      clientId: platformClientId,
      scopes: ["profile", "email"],
      grantOfflineAccess: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[auth][nativeGoogle] GoogleAuth.initialize failed:", describeError(err));
    throw new Error(`GoogleAuth init failed: ${describeError(err)}`);
  }

  let googleUser: Awaited<ReturnType<typeof GoogleAuth.signIn>>;
  try {
    googleUser = await GoogleAuth.signIn();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[auth][nativeGoogle] GoogleAuth.signIn failed:", describeError(err));
    const msg = describeError(err);
    // Common Android cause: SHA-1 not registered → DEVELOPER_ERROR (code 10).
    if (msg.includes("10") || msg.toLowerCase().includes("developer_error")) {
      throw new Error(
        "Google sign-in failed (DEVELOPER_ERROR). The Android app's SHA-1 fingerprint " +
          "is likely not registered for this OAuth client in Google Cloud Console.",
      );
    }
    throw new Error(`Google sign-in cancelled or failed: ${msg}`);
  }

  const idToken = googleUser?.authentication?.idToken;
  if (!idToken) {
    throw new Error("Google sign-in did not return an id_token");
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[auth][nativeGoogle] got id_token, exchanging with backend", {
      email: googleUser.email,
    });
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[auth][nativeGoogle] backend id_token exchange failed:", describeError(error));
    throw new Error(describeError(error));
  }

  const session = data?.session;
  const user = data?.user || session?.user;
  if (!session || !user) {
    throw new Error("Backend did not return a session for this Google account");
  }

  return {
    userId: user.id,
    email: user.email ?? googleUser.email ?? null,
    name:
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      googleUser.name ||
      null,
  };
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
 * @deprecated The ex_supabase backend does not support the Supabase OAuth
 * redirect flow. Use {@link signInWithGoogleNative} instead on mobile.
 * Kept here for reference / potential Apple sign-in reuse.
 *
 * Sign in with OAuth on mobile platforms using Capacitor Browser.
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

