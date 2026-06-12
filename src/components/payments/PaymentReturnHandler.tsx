import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import {
  clearBillplzPendingOrderId,
  consumeBillplzReturnPath,
  isBillplzReturnSearch,
  isNativeCapacitor,
  markBillplzReturnHandled,
  parseBillplzOrderIdFromPath,
  parseBillplzWebOrderReturn,
  parsePaymentReturnDeepLink,
  redirectBundledAppToOrder,
  rememberCapacitorAppOrigin,
  wasBillplzReturnHandled,
} from "@/lib/payments/billplzRedirect";
import { closeBillplzPaymentBrowser } from "@/lib/payments/openBillplzPayment";

function navigateToOrder(
  navigate: ReturnType<typeof useNavigate>,
  orderId: string,
  search: string,
) {
  if (wasBillplzReturnHandled(orderId)) return;

  markBillplzReturnHandled(orderId);
  clearBillplzPendingOrderId();
  navigate(`/orders/${orderId}${search}`, { replace: true });
}

/**
 * Handles Billplz return on native:
 *
 * Browser.open → Billplz → bank → deep link → appUrlOpen → Browser.close() → /orders/{id}
 * Legacy fallback: shop3.jimatbiz.com in WebView → reload bundled app root → client navigate
 */
export function PaymentReturnHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const reloadingFromShop3 = useRef(false);

  useEffect(() => {
    if (!isNativeCapacitor()) return;
    rememberCapacitorAppOrigin();

    const pendingPath = consumeBillplzReturnPath();
    if (pendingPath) {
      const orderId = parseBillplzOrderIdFromPath(pendingPath.split("?")[0] ?? "");
      if (orderId) markBillplzReturnHandled(orderId);
      navigate(pendingPath, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!isNativeCapacitor() || reloadingFromShop3.current) return;

    // Only when the main WebView is on shop3 (legacy bills), bounce to bundled app root.
    const webReturn = parseBillplzWebOrderReturn(
      `${window.location.origin}${location.pathname}${location.search}`,
    );

    if (webReturn) {
      if (wasBillplzReturnHandled(webReturn.orderId)) return;

      reloadingFromShop3.current = true;
      redirectBundledAppToOrder(webReturn.orderId, webReturn.search);
      return;
    }

    // Already on bundled app with Billplz query params (deep link or post-reload resume).
    const orderId = parseBillplzOrderIdFromPath(location.pathname);
    if (orderId && isBillplzReturnSearch(location.search)) {
      navigateToOrder(navigate, orderId, location.search);
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!isNativeCapacitor()) return;

    const handleUrl = async ({ url }: { url: string }) => {
      const parsed = parsePaymentReturnDeepLink(url);
      if (!parsed) return;
      if (wasBillplzReturnHandled(parsed.orderId)) return;

      await closeBillplzPaymentBrowser();
      navigateToOrder(navigate, parsed.orderId, parsed.search);
    };

    let urlListener: { remove: () => void } | null = null;
    let browserListener: { remove: () => void } | null = null;

    App.addListener("appUrlOpen", handleUrl).then((l) => {
      urlListener = l;
    });

    App.getLaunchUrl().then((result) => {
      if (result?.url) handleUrl({ url: result.url });
    });

    Browser.addListener("browserFinished", () => {
      clearBillplzPendingOrderId();
    }).then((l) => {
      browserListener = l;
    });

    return () => {
      urlListener?.remove();
      browserListener?.remove();
    };
  }, [navigate]);

  return null;
}
