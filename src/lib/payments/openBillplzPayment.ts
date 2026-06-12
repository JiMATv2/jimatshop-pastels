import { Browser } from "@capacitor/browser";
import {
  isNativeCapacitor,
  setBillplzPendingOrderId,
} from "@/lib/payments/billplzRedirect";

/**
 * Open Billplz checkout.
 *
 * Native: Capacitor Browser (Chrome Custom Tabs / SFSafariViewController).
 * The main app WebView stays on checkout; Billplz + FPX bank pages load in this
 * in-app browser. When Billplz redirects to our deep link, PaymentReturnHandler
 * receives appUrlOpen and calls {@link closeBillplzPaymentBrowser}.
 *
 * Web: same-tab navigation.
 */
export async function openBillplzPayment(billUrl: string, orderId: string): Promise<void> {
  setBillplzPendingOrderId(orderId);

  if (!isNativeCapacitor()) {
    window.location.href = billUrl;
    return;
  }

  await Browser.open({ url: billUrl });
}

/** Dismiss the in-app browser after Billplz deep-link return. */
export async function closeBillplzPaymentBrowser(): Promise<void> {
  if (!isNativeCapacitor()) return;

  try {
    await Browser.close();
  } catch {
    // iOS/Android may already dismiss the tab when handing off to the app URL scheme.
  }
}
