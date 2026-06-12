import { Capacitor } from "@capacitor/core";

/** Capacitor deep link base for Billplz return (host: payment-return). */
export const PAYMENT_RETURN_DEEP_LINK_BASE = "com.jimatbiz.shop3://payment-return";

const CAPACITOR_APP_ORIGIN_KEY = "capacitor_app_origin";
const BILLPLZ_PENDING_ORDER_KEY = "billplz_pending_order_id";
const BILLPLZ_RETURN_PATH_KEY = "billplz_return_path";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isNativeCapacitor(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() !== "web";
}

function isRemoteAppHost(hostname: string): boolean {
  return (
    hostname === "shop3.jimatbiz.com" ||
    hostname.endsWith(".jimatbiz.com") ||
    hostname === "jimatshop.jimatbiz.com"
  );
}

/** Bundled Capacitor app (not shop3 website). */
export function isBundledAppHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "" // capacitor://localhost
  );
}

const BILLPLZ_HANDLED_RETURN_KEY = "billplz_handled_return_order_id";

export function markBillplzReturnHandled(orderId: string): void {
  sessionStorage.setItem(BILLPLZ_HANDLED_RETURN_KEY, orderId);
}

export function wasBillplzReturnHandled(orderId: string): boolean {
  return sessionStorage.getItem(BILLPLZ_HANDLED_RETURN_KEY) === orderId;
}

export function clearBillplzReturnHandled(): void {
  sessionStorage.removeItem(BILLPLZ_HANDLED_RETURN_KEY);
}

/** Remember bundled app origin before Billplz navigates the WebView away. */
export function rememberCapacitorAppOrigin(): void {
  if (!isNativeCapacitor() || isRemoteAppHost(window.location.hostname)) return;
  sessionStorage.setItem(CAPACITOR_APP_ORIGIN_KEY, window.location.origin);
}

export function getCapacitorBundledOrigin(): string {
  const remembered = sessionStorage.getItem(CAPACITOR_APP_ORIGIN_KEY);
  if (remembered) return remembered;

  return Capacitor.getPlatform() === "ios" ? "capacitor://localhost" : "https://localhost";
}

export function setBillplzPendingOrderId(orderId: string): void {
  sessionStorage.setItem(BILLPLZ_PENDING_ORDER_KEY, orderId);
  clearBillplzReturnHandled();
}

export function getBillplzPendingOrderId(): string | null {
  return sessionStorage.getItem(BILLPLZ_PENDING_ORDER_KEY);
}

export function clearBillplzPendingOrderId(): void {
  sessionStorage.removeItem(BILLPLZ_PENDING_ORDER_KEY);
}

/**
 * Base URL sent to ex_supabase when creating a Billplz bill.
 * Native: deep link so Billplz re-opens the Capacitor app after payment.
 * Web: deployed app origin (VITE_APP_URL).
 */
export function getBillplzRedirectBase(): string {
  if (isNativeCapacitor()) {
    return PAYMENT_RETURN_DEEP_LINK_BASE;
  }

  const base =
    (import.meta.env.VITE_APP_URL as string | undefined) ||
    (typeof window !== "undefined" ? window.location.origin : "https://shop3.jimatbiz.com");

  return base.replace(/\/+$/, "");
}

export function buildBillplzRedirectUrl(orderId: string): string {
  return `${getBillplzRedirectBase()}/orders/${orderId}`;
}

export function parsePaymentReturnDeepLink(
  raw: string,
): { orderId: string; search: string } | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "com.jimatbiz.shop3:" || url.hostname !== "payment-return") {
      return null;
    }

    const match = url.pathname.match(/^\/orders\/([0-9a-f-]{36})$/i);
    if (!match) return null;

    return { orderId: match[1], search: url.search };
  } catch {
    return null;
  }
}

/**
 * Parse Billplz return on the deployed website only (shop3.jimatbiz.com).
 * Must NOT match https://localhost — that would reload the bundled app in a loop.
 */
export function parseBillplzWebOrderReturn(
  raw: string,
): { orderId: string; search: string } | null {
  try {
    const url = new URL(raw);
    if (!isRemoteAppHost(url.hostname) || isBundledAppHost(url.hostname)) {
      return null;
    }

    const match = url.pathname.match(/^\/orders\/([0-9a-f-]{36})$/i);
    if (!match) return null;

    const hasBillplzParam = [...url.searchParams.keys()].some((key) => key.includes("billplz"));
    if (!hasBillplzParam) return null;

    return { orderId: match[1], search: url.search };
  } catch {
    return null;
  }
}

export function parseBillplzOrderIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/orders\/([0-9a-f-]{36})$/i);
  if (!match || !UUID_RE.test(match[1])) return null;
  return match[1];
}

export function isBillplzReturnSearch(search: string): boolean {
  if (!search) return false;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return [...params.keys()].some((key) => key.includes("billplz"));
}

export function stashBillplzReturnPath(orderId: string, search = ""): void {
  const qs = search.startsWith("?") || !search ? search : `?${search}`;
  sessionStorage.setItem(BILLPLZ_RETURN_PATH_KEY, `/orders/${orderId}${qs}`);
}

export function consumeBillplzReturnPath(): string | null {
  const path = sessionStorage.getItem(BILLPLZ_RETURN_PATH_KEY);
  if (!path) return null;
  sessionStorage.removeItem(BILLPLZ_RETURN_PATH_KEY);
  return path;
}

/**
 * Reload the bundled app root, then resume the order route client-side.
 * Avoids full reload at /orders/:id which breaks relative asset paths.
 */
export function redirectBundledAppToOrder(orderId: string, search = ""): void {
  stashBillplzReturnPath(orderId, search);
  window.location.replace(`${getCapacitorBundledOrigin()}/`);
}
