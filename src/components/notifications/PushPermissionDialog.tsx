import React, { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Bell, X } from "lucide-react";
import { notificationService } from "@/lib/notifications/notificationService";
import { useAuth } from "@/lib/auth/AuthProvider";

const STORAGE_KEY = "jimatshop_push_permission_asked";

export function PushPermissionDialog() {
  const [visible, setVisible] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (loading) return;
    if (!user?.id) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Small delay so it doesn't appear instantly after sign-in
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [loading, user?.id]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  const handleEnable = async () => {
    if (!user?.id) return;
    localStorage.setItem(STORAGE_KEY, "asked");
    setVisible(false);
    await notificationService.requestPermissionAndGetToken(user.id);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300"
        style={{ zIndex: 51 }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto">
          <Bell className="text-primary" size={28} />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Stay in the loop!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Would you like to enable push notifications for promos and order updates?
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleEnable}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Enable Notifications
          </button>
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-xl text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
