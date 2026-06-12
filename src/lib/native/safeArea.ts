import { Capacitor } from "@capacitor/core";

/**
 * Keep app chrome below the OS status bar / notch on native.
 * CSS safe-area utilities handle any remaining inset when edge-to-edge is active.
 */
export async function initNativeSafeArea(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#ffffff" });
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[safeArea] StatusBar setup skipped", error);
    }
  }
}
