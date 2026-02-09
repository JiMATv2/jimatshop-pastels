import { messaging, getToken } from "@/lib/firebase/config";
import { supabase } from "@/lib/supabase/client";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  PushNotifications,
  PushNotificationActionPerformed,
  PushNotificationSchema,
  PushNotificationToken,
} from "@capacitor/push-notifications";

class NotificationService {
  private vapidKey: string;
  private androidPushEnabled: boolean;
  private iosPushEnabled: boolean;
  private nativeListenersRegistered = false;
  private pendingNativeTokenPromise?: Promise<string | null>;
  private pendingNativeTokenResolve?: (token: string | null) => void;
  private pendingNativeTokenTimeout?: ReturnType<typeof setTimeout>;
  private nativeUserId?: string;

  constructor() {
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
    this.androidPushEnabled =
      (import.meta.env.VITE_ENABLE_ANDROID_PUSH || "").toLowerCase() === "true";
    this.iosPushEnabled =
      (import.meta.env.VITE_ENABLE_IOS_PUSH || "").toLowerCase() === "true";
  }

  init() {
    if (!this.isAndroidNative() && !this.isIOSNative()) return;

    if (this.isAndroidNative() && !this.androidPushEnabled) {
      console.warn(
        "[notifications] Android push disabled (set VITE_ENABLE_ANDROID_PUSH=true to enable)",
      );
      return;
    }

    if (this.isIOSNative() && !this.iosPushEnabled) {
      console.warn(
        "[notifications] iOS push disabled (set VITE_ENABLE_IOS_PUSH=true to enable)",
      );
      return;
    }

    this.ensureNativeListeners();
  }

  private async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  private async saveTokenToDatabase(userId: string, token: string, platform: string) {
    try {
      const { error } = await supabase
        .from("user_notification_tokens" as any)
        .upsert(
          {
            user_id: userId,
            fcm_token: token,
            platform,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,platform,fcm_token",
          },
        );

      if (error) throw error;
    } catch (error) {
      console.error("Error saving FCM token:", error);
    }
  }

  private isAndroidNative() {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  }

  private isIOSNative() {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  }

  private clearPendingNativeToken() {
    if (this.pendingNativeTokenTimeout) {
      clearTimeout(this.pendingNativeTokenTimeout);
    }
    this.pendingNativeTokenPromise = undefined;
    this.pendingNativeTokenResolve = undefined;
    this.pendingNativeTokenTimeout = undefined;
  }

  private ensureNativeListeners() {
    if (this.nativeListenersRegistered) return;
    this.nativeListenersRegistered = true;

    PushNotifications.addListener(
      "registration",
      async (token: PushNotificationToken) => {
        const tokenValue = token.value;
        if (this.nativeUserId && tokenValue) {
          const platform = this.isIOSNative() ? "ios" : "android";
          await this.saveTokenToDatabase(this.nativeUserId, tokenValue, platform);
        }
        if (this.pendingNativeTokenResolve) {
          this.pendingNativeTokenResolve(tokenValue || null);
          this.clearPendingNativeToken();
        }
      },
    );

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
      if (this.pendingNativeTokenResolve) {
        this.pendingNativeTokenResolve(null);
        this.clearPendingNativeToken();
      }
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      async (notification: PushNotificationSchema) => {
        const shouldShowLocal = document.visibilityState === "visible";
        if (!shouldShowLocal) return;

        try {
          await LocalNotifications.requestPermissions();
          const notificationId = Date.now() % 2147483647;
          await LocalNotifications.schedule({
            notifications: [
              {
                id: notificationId,
                title: notification.title || "New update",
                body: notification.body || "You have a new notification",
                extra: notification.data || {},
                smallIcon: "ic_notification",
              },
            ],
          });
        } catch (error) {
          console.error("Local notification scheduling failed:", error);
        }
      },
    );

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification: PushNotificationActionPerformed) => {
        const url = notification.notification?.data?.url;
        if (typeof url === "string" && url.length > 0) {
          window.location.assign(url);
        }
      },
    );
  }

  private async getNativeToken(userId: string) {
    this.nativeUserId = userId;
    this.ensureNativeListeners();

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") return null;

    if (!this.pendingNativeTokenPromise) {
      this.pendingNativeTokenPromise = new Promise((resolve) => {
        this.pendingNativeTokenResolve = resolve;
        this.pendingNativeTokenTimeout = setTimeout(() => {
          resolve(null);
          this.clearPendingNativeToken();
        }, 10000);
      });
    }

    await PushNotifications.register();
    return this.pendingNativeTokenPromise;
  }

  async requestPermissionAndGetToken(userId: string) {
    if (this.isAndroidNative() && !this.androidPushEnabled) {
      console.warn(
        "[notifications] Android push disabled (set VITE_ENABLE_ANDROID_PUSH=true to enable)",
      );
      return null;
    }

    if (this.isIOSNative() && !this.iosPushEnabled) {
      console.warn(
        "[notifications] iOS push disabled (set VITE_ENABLE_IOS_PUSH=true to enable)",
      );
      return null;
    }

    if (this.isAndroidNative() || this.isIOSNative()) {
      return this.getNativeToken(userId);
    }

    if (!messaging) return null;

    await this.registerServiceWorker();

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return null;

      const currentToken = await getToken(messaging, {
        vapidKey: this.vapidKey,
      });

      if (!currentToken) return null;

      await this.saveTokenToDatabase(userId, currentToken, "web");
      return currentToken;
    } catch (error) {
      console.error("Error retrieving FCM token:", error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();

