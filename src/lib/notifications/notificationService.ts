import { messaging, getToken } from "@/lib/firebase/config";
import { supabase } from "@/lib/supabase/client";

class NotificationService {
  private vapidKey: string;

  constructor() {
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
  }

  private async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  private async saveTokenToDatabase(userId: string, token: string) {
    try {
      const { error } = await supabase
        .from("user_notification_tokens" as any)
        .upsert(
          {
            user_id: userId,
            fcm_token: token,
            platform: "web",
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

  async requestPermissionAndGetToken(userId: string) {
    if (!messaging) return null;

    await this.registerServiceWorker();

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return null;

      const currentToken = await getToken(messaging, {
        vapidKey: this.vapidKey,
      });

      if (!currentToken) return null;

      await this.saveTokenToDatabase(userId, currentToken);
      return currentToken;
    } catch (error) {
      console.error("Error retrieving FCM token:", error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();

