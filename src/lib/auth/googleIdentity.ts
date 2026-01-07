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

export async function getGoogleIdToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("Missing VITE_GOOGLE_CLIENT_ID");
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: GoogleCredentialResponse) => {
          if (!resp?.credential) {
            // eslint-disable-next-line no-console
            console.error("[auth][googleIdentity] missing id_token in Google callback", resp);
            reject(new Error("Google login did not return an id_token"));
            return;
          }
          resolve(resp.credential);
        },
      });

      // Show the Google One Tap prompt (or account chooser) as a result of user action.
      window.google.accounts.id.prompt((notification: any) => {
        const info = describeOneTapNotification(notification);
        if (info.isNotDisplayed || info.isSkippedMoment || info.isDismissedMoment) {
          // eslint-disable-next-line no-console
          console.warn("[auth][googleIdentity] Google One Tap not completed", info);

          const reason =
            info.notDisplayedReason || info.skippedReason || info.dismissedReason || "unknown_reason";
          reject(new Error(`Google login was cancelled or not displayed (${reason})`));
          return;
        }

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug("[auth][googleIdentity] Google One Tap moment", info);
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[auth][googleIdentity] Google login failed", e);
      reject(e instanceof Error ? e : new Error("Google login failed"));
    }
  });
}


