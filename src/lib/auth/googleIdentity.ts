type GoogleCredentialResponse = {
  credential: string; // JWT id_token
  select_by?: string;
  clientId?: string;
};

function safeCall<T>(fn: (() => T) | undefined): T | undefined {
  try {
    return fn?.();
  } catch {
    return undefined;
  }
}

function describeOneTapNotification(notification: any) {
  const isNotDisplayed = Boolean(safeCall(notification?.isNotDisplayed?.bind(notification)));
  const isSkippedMoment = Boolean(safeCall(notification?.isSkippedMoment?.bind(notification)));
  const isDismissedMoment = Boolean(safeCall(notification?.isDismissedMoment?.bind(notification)));

  return {
    momentType: safeCall(notification?.getMomentType?.bind(notification)),
    isNotDisplayed,
    notDisplayedReason: isNotDisplayed
      ? safeCall(notification?.getNotDisplayedReason?.bind(notification))
      : undefined,
    isSkippedMoment,
    skippedReason: isSkippedMoment ? safeCall(notification?.getSkippedReason?.bind(notification)) : undefined,
    isDismissedMoment,
    dismissedReason: isDismissedMoment
      ? safeCall(notification?.getDismissedReason?.bind(notification))
      : undefined,
  };
}

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity script")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity script"));
    document.head.appendChild(script);
  });
}

/**
 * Get the appropriate Google Client ID based on platform
 */
function getGoogleClientId(): string {
  // Check if we're on Android and have an Android-specific client ID
  const isAndroid = typeof window !== "undefined" && 
    (window.navigator.userAgent.includes("Android") || 
     (window as any).Capacitor?.getPlatform?.() === "android");
  
  const androidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_ANDROID as string | undefined;
  const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  
  // Prefer Android client ID on Android platform
  if (isAndroid && androidClientId) {
    return androidClientId;
  }
  
  // Fall back to web client ID
  if (webClientId) {
    return webClientId;
  }
  
  throw new Error("Missing VITE_GOOGLE_CLIENT_ID (or VITE_GOOGLE_CLIENT_ID_ANDROID for Android)");
}

/**
 * Get Google ID token using Google Identity Services.
 * Attempts to use One Tap prompt, with graceful fallback handling.
 */
export async function getGoogleIdToken(): Promise<string> {
  const clientId = getGoogleClientId();

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    let callbackInvoked = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleCallback = (resp: GoogleCredentialResponse) => {
      if (callbackInvoked) return;
      callbackInvoked = true;
      cleanup();

      if (!resp?.credential) {
        // eslint-disable-next-line no-console
        console.error("[auth][googleIdentity] missing id_token in Google callback", resp);
        reject(new Error("Google login did not return an id_token"));
        return;
      }
      resolve(resp.credential);
    };

    try {
      // Initialize Google Identity Services
      // Note: FedCM is optional and may cause issues in some browsers/environments
      // We'll let Google handle it automatically rather than forcing it
      const initConfig: {
        client_id: string;
        callback: (resp: GoogleCredentialResponse) => void;
        use_fedcm_for_prompt?: boolean;
        auto_select?: boolean;
      } = {
        client_id: clientId,
        callback: handleCallback,
        auto_select: false,
      };

      // Only enable FedCM if explicitly supported (avoid forcing it)
      // This helps avoid "Provider's accounts list is empty" errors
      if (typeof window !== "undefined" && "IdentityCredential" in window) {
        initConfig.use_fedcm_for_prompt = true;
      }

      window.google.accounts.id.initialize(initConfig);

      // Show the Google One Tap prompt
      // The notification callback is called immediately to indicate if prompt can be shown
      window.google.accounts.id.prompt((notification: any) => {
        const info = describeOneTapNotification(notification);

        // If prompt was displayed successfully, wait for user interaction
        if (!info.isNotDisplayed && !info.isSkippedMoment && !info.isDismissedMoment) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.debug("[auth][googleIdentity] Google One Tap displayed", info);
          }
          // Set a reasonable timeout for user interaction
          timeoutId = setTimeout(() => {
            if (!callbackInvoked) {
              cleanup();
              reject(new Error("Google login timed out. Please try again."));
            }
          }, 60000); // 60 seconds
          return;
        }

        // Prompt was not displayed - provide helpful error message
        const reason =
          info.notDisplayedReason || info.skippedReason || info.dismissedReason || "unknown_reason";

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("[auth][googleIdentity] Google One Tap not displayed", {
            reason,
            momentType: info.momentType,
            isNotDisplayed: info.isNotDisplayed,
            isSkippedMoment: info.isSkippedMoment,
            isDismissedMoment: info.isDismissedMoment,
          });
        }

        // Common reasons and user-friendly messages
        let userMessage = "Google sign-in is not available. ";
        if (reason === "browser_not_supported") {
          userMessage += "Please use a supported browser.";
        } else if (reason === "invalid_client") {
          userMessage += "Google sign-in is not properly configured.";
        } else if (reason === "missing_client_id") {
          userMessage += "Google sign-in is not properly configured.";
        } else if (reason === "opt_out_or_no_session") {
          userMessage += "Please sign in with your Google account.";
        } else if (reason === "suppressed_by_user") {
          userMessage += "Sign-in was cancelled. Please try again.";
        } else if (reason === "unregistered_origin") {
          userMessage += "This domain is not registered for Google sign-in.";
        } else if (reason === "unknown_reason") {
          userMessage +=
            "Google sign-in prompt could not be displayed. This may be due to browser settings or no Google account being available.";
        } else {
          userMessage += `Reason: ${reason}`;
        }

        cleanup();
        reject(new Error(userMessage));
      });
    } catch (e) {
      cleanup();
      // eslint-disable-next-line no-console
      console.error("[auth][googleIdentity] Google login failed", e);
      reject(e instanceof Error ? e : new Error("Google login failed"));
    }
  });
}


