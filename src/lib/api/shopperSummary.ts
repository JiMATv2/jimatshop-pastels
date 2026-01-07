import { supabase } from "@/lib/supabase/client";
import { resolveShopperId } from "@/lib/api/shopper";

export type ShopperSummary = {
  totalOrders: number;
  totalSpend: number;
  processingOrders: number;
  availableVouchers: number;
  latestShippingStatus: string;
};

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function fetchShopperSummary(args: {
  authUserId: string;
  email?: string | null;
}): Promise<ShopperSummary> {
  const shopperId = await resolveShopperId({ authUserId: args.authUserId, email: args.email });

  // If shopper profile isn't linked yet, keep safe zeros.
  if (!shopperId) {
    return {
      totalOrders: 0,
      totalSpend: 0,
      processingOrders: 0,
      availableVouchers: 0,
      latestShippingStatus: "Tiada penghantaran aktif",
    };
  }

  // Fetch shopper orders (simple client-side aggregate; OK for now, can be replaced with a RPC later).
  const { data: orders, error: ordersErr } = await supabase
    .from("jimatshop_orders")
    .select("id,total_amount,status,updated_at")
    .eq("shopper_id", shopperId)
    .order("updated_at", { ascending: false });

  if (ordersErr) throw ordersErr;

  const orderRows = (orders ?? []) as Array<{
    id: string;
    total_amount: unknown;
    status: string;
    updated_at: string;
  }>;

  const totalOrders = orderRows.length;
  const totalSpend = orderRows.reduce((sum, r) => sum + asNumber(r.total_amount), 0);
  const processingOrders = orderRows.filter((r) =>
    ["pending", "processing", "ready"].includes(r.status),
  ).length;

  // Latest delivery status: attempt to load deliveries for recent orders.
  // Note: jimatshop_deliveries has RLS enabled; if blocked, we fall back gracefully.
  let latestShippingStatus = "Tiada penghantaran aktif";
  const recentOrderIds = orderRows.slice(0, 50).map((o) => o.id);
  if (recentOrderIds.length) {
    const { data: deliveries, error: deliveriesErr } = await supabase
      .from("jimatshop_deliveries")
      .select("status,updated_at,delivery_ref,delivery_date,jimatshop_order_id")
      .in("jimatshop_order_id", recentOrderIds)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (!deliveriesErr) {
      const d = (deliveries ?? [])[0] as
        | {
            status: string;
            updated_at?: string | null;
            delivery_ref?: string | null;
            delivery_date?: string | null;
            jimatshop_order_id: string;
          }
        | undefined;
      if (d?.status) latestShippingStatus = d.status;
    }
  }

  // TODO: Replace with actual voucher/coupon logic when the table/API is available.
  const availableVouchers = 0;

  return {
    totalOrders,
    totalSpend,
    processingOrders,
    availableVouchers,
    latestShippingStatus,
  };
}


