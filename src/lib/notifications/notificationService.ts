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
import { Preferences } from "@capacitor/preferences";

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
    // Enabled on native by default; set VITE_ENABLE_*_PUSH=false to opt out.
    this.androidPushEnabled =
      (import.meta.env.VITE_ENABLE_ANDROID_PUSH ?? "true").toLowerCase() !== "false";
    this.iosPushEnabled =
      (import.meta.env.VITE_ENABLE_IOS_PUSH ?? "true").toLowerCase() !== "false";
  }

  isNativePushEnabled(): boolean {
    if (this.isAndroidNative()) return this.androidPushEnabled;
    if (this.isIOSNative()) return this.iosPushEnabled;
    return true;
  }

  init() {
    if (!this.isAndroidNative() && !this.isIOSNative()) return;

    if (!this.isNativePushEnabled()) {
      console.warn(
        "[notifications] Native push disabled via VITE_ENABLE_ANDROID_PUSH=false or VITE_ENABLE_IOS_PUSH=false",
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

  private async getiOSFcmToken(retries = 10, delayMs = 1000): Promise<string | null> {
    // Firebase delivers the FCM token via MessagingDelegate (Swift) which stores it
    // in UserDefaults under 'CapacitorStorage.fcm_ios_token' key.
    // We poll because there is an async gap after register() before Firebase resolves.
    for (let i = 0; i < retries; i++) {
      const { value } = await Preferences.get({ key: "fcm_ios_token" });
      if (value) return value;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return null;
  }

  private async getNativeToken(userId: string) {
    this.nativeUserId = userId;
    this.ensureNativeListeners();

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") return null;

    await PushNotifications.register();

    // On iOS, the Capacitor registration event returns the raw APNs hex token,
    // NOT an FCM token. Firebase exchanges it asynchronously via MessagingDelegate.
    // We read the real FCM token from UserDefaults where AppDelegate stored it.
    if (this.isIOSNative()) {
      const fcmToken = await this.getiOSFcmToken();
      if (fcmToken) {
        await this.saveTokenToDatabase(userId, fcmToken, "ios");
        return fcmToken;
      }
      console.warn("[notifications] iOS FCM token not yet available after polling");
      return null;
    }

    // Android: use the promise-based registration event (FCM token comes directly)
    if (!this.pendingNativeTokenPromise) {
      this.pendingNativeTokenPromise = new Promise((resolve) => {
        this.pendingNativeTokenResolve = resolve;
        this.pendingNativeTokenTimeout = setTimeout(() => {
          resolve(null);
          this.clearPendingNativeToken();
        }, 10000);
      });
    }

    return this.pendingNativeTokenPromise;
  }

  async requestPermissionAndGetToken(userId: string) {
    if ((this.isAndroidNative() || this.isIOSNative()) && !this.isNativePushEnabled()) {
      console.warn("[notifications] Native push is disabled in app config");
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

