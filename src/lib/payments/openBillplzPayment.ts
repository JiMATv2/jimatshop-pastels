import { Browser } from "@capacitor/browser";
import {
  isNativeCapacitor,
  setBillplzPendingOrderId,
} from "@/lib/payments/billplzRedirect";

/**
 * Append auto_submit for Billplz checkout redirects. Leaves other gateways (e.g. Chip-in) intact.
 */
export function getPaymentRedirectUrl(url: string): string {
  if (!url) return url;
  if (!url.includes("billplz")) return url;
  return url.includes("?") ? `${url}&auto_submit=true` : `${url}?auto_submit=true`;
}

/**
 * Open online payment gateway checkout (Chip-in Collect or Billplz).
 *
 * Native: Capacitor Browser (Chrome Custom Tabs / SFSafariViewController).
 * The main app WebView stays on checkout; payment gateway + FPX bank pages load in this
 * in-app browser. When gateway redirects to our deep link, PaymentReturnHandler
 * receives appUrlOpen and calls {@link closePaymentBrowser}.
 *
 * Web: same-tab navigation.
 */
export async function openPaymentGateway(paymentUrl: string, orderId: string): Promise<void> {
  setBillplzPendingOrderId(orderId);

  const finalUrl = getPaymentRedirectUrl(paymentUrl);

  if (!isNativeCapacitor()) {
    window.location.href = finalUrl;
    return;
  }

  await Browser.open({ url: finalUrl });
}

export const openBillplzPayment = openPaymentGateway;

/** Dismiss the in-app browser after gateway deep-link return. */
export async function closePaymentBrowser(): Promise<void> {
  if (!isNativeCapacitor()) return;

  try {
    await Browser.close();
  } catch {
    // iOS/Android may already dismiss the tab when handing off to the app URL scheme.
  }
}

export const closeBillplzPaymentBrowser = closePaymentBrowser;
