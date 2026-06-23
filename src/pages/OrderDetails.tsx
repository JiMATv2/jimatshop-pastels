import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatJimatshopOrderNumber } from "@/lib/orders/formatOrderNumber";
import { formatPaymentMethodLabel } from "@/lib/orders/formatPaymentMethod";
import { resolveProductImageUrl } from "@/lib/products/imageUrl";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";

type OrderRow = {
  id: string;
  status: string;
  total_amount: unknown;
  created_at: string;
  updated_at: string;
  shipping_address: unknown;
  payment_status: string;
  payment_method: string | null;
  refund_status?: string | null;
};

type OrderItemRow = {
  id: string;
  quantity: number;
  unit_price: unknown;
  subtotal: unknown;
  buyer_inventory_id: string;
};

type InventoryRow = {
  id: string;
  product_id: string;
};

type ProductRow = {
  id: string;
  name: string;
  image_url?: string | null;
  cover_image_url?: string | null;
  jimatshop_image_url?: string | null;
};

type DeliveryRow = {
  status: string;
  delivery_ref?: string | null;
  delivery_date?: string | null;
  updated_at?: string | null;
};

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (["cancelled"].includes(status)) return "destructive";
  if (["completed", "delivered"].includes(status)) return "secondary";
  if (["processing", "ready", "pending"].includes(status)) return "default";
  return "outline";
}

function safeString(v: unknown): string | null {
  if (typeof v === "string") return v;
  return null;
}

export default function OrderDetails() {
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const handledBillplzReturn = useRef(false);

  const id = orderId ?? "";

  useEffect(() => {
    if (handledBillplzReturn.current) return;

    const billplzPaid =
      searchParams.get("billplz[paid]") ?? searchParams.get("billplz%5Bpaid%5D");
    if (billplzPaid == null) return;

    handledBillplzReturn.current = true;

    if (billplzPaid === "true") {
      toast({
        title: "Payment received",
        description: "Your Billplz payment was successful. We're processing your order.",
      });
    } else {
      toast({
        title: "Payment not completed",
        description: "Billplz payment was not completed. You can retry from your order details.",
        variant: "destructive",
      });
    }

    const next = new URLSearchParams(searchParams);
    for (const key of [...next.keys()]) {
      if (key.includes("billplz")) next.delete(key);
    }
    next.delete("payment_type");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["order-details", user?.id, id],
    enabled: Boolean(user && id),
    queryFn: async () => {
      if (!user || !id) throw new Error("Missing auth or order id");

      const shopperId = await resolveShopperId({ authUserId: user.id, email: user.email });
      if (!shopperId) throw new Error("Shopper profile not found");

      // Fetch order and validate ownership by shopper_id.
      const { data: order, error: orderErr } = await supabase
        .from("jimatshop_orders")
        .select("id,status,total_amount,created_at,updated_at,shipping_address,shopper_id,payment_status,payment_method,refund_status")
        .eq("id", id)
        .maybeSingle();

      if (orderErr) throw orderErr;
      if (!order) throw new Error("Order not found");
      if ((order as any).shopper_id !== shopperId) throw new Error("Unauthorized");

      const orderRow: OrderRow = {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        updated_at: (order as any).updated_at,
        shipping_address: (order as any).shipping_address,
        payment_status: (order as any).payment_status ?? "unknown",
        payment_method: (order as any).payment_method ?? null,
        refund_status: (order as any).refund_status ?? null,
      };

      // Items
      const { data: items, error: itemsErr } = await supabase
        .from("jimatshop_order_items")
        .select("id,quantity,unit_price,subtotal,buyer_inventory_id")
        .eq("order_id", id);

      if (itemsErr) throw itemsErr;

      const itemRows = (items ?? []) as OrderItemRow[];
      const inventoryIds = Array.from(new Set(itemRows.map((r) => r.buyer_inventory_id).filter(Boolean)));

      let inventoryMap = new Map<string, InventoryRow>();
      let productMap = new Map<string, ProductRow>();

      if (inventoryIds.length) {
        const { data: inventories, error: invErr } = await supabase
          .from("buyer_inventories")
          .select("id,product_id")
          .in("id", inventoryIds);

        if (invErr) throw invErr;
        for (const inv of (inventories ?? []) as InventoryRow[]) inventoryMap.set(inv.id, inv);

        const productIds = Array.from(
          new Set((inventories ?? []).map((i: any) => i.product_id).filter(Boolean)),
        ) as string[];

        if (productIds.length) {
          const { data: products, error: prodErr } = await supabase
            .from("products")
            .select("id,name,image_url,cover_image_url,jimatshop_image_url")
            .in("id", productIds);

          if (prodErr) throw prodErr;
          for (const p of (products ?? []) as ProductRow[]) productMap.set(p.id, p);
        }
      }

      // Delivery (best-effort; RLS may block)
      let delivery: DeliveryRow | null = null;
      const { data: deliveries, error: delErr } = await supabase
        .from("jimatshop_deliveries")
        .select("status,delivery_ref,delivery_date,updated_at")
        .eq("jimatshop_order_id", id)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (!delErr) {
        delivery = ((deliveries ?? [])[0] as DeliveryRow | undefined) ?? null;
      }

      return {
        order: orderRow,
        items: itemRows,
        inventoryMap,
        productMap,
        delivery,
      };
    },
    staleTime: 30_000,
  });

  const shippingLines = useMemo(() => {
    const raw = data?.order?.shipping_address;
    if (!raw || typeof raw !== "object") return [] as string[];
    const any = raw as any;
    return [
      safeString(any.name),
      safeString(any.phone),
      safeString(any.line1),
      safeString(any.line2),
      [safeString(any.postcode), safeString(any.city)].filter(Boolean).join(" "),
      safeString(any.state),
    ].filter((s): s is string => Boolean(s && s.trim()));
  }, [data?.order?.shipping_address]);

  const orderHeader = (
    <div className="flex items-center gap-3 mb-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground truncate">Order details</h2>
        <p className="text-xs text-muted-foreground truncate">
          {id ? formatJimatshopOrderNumber(id) : ""}
        </p>
      </div>
    </div>
  );

  const summaryCard = data ? (
    <div className="jimat-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Summary</p>
        <Badge variant={statusVariant(data.order.status)} className="capitalize">
          {data.order.status}
        </Badge>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("ms-MY", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }).format(new Date(data.order.created_at))}
        </p>
        <p className="text-sm font-bold text-primary">{formatMYR(asNumber(data.order.total_amount))}</p>
      </div>

      {data.delivery ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Delivery: <span className="capitalize">{data.delivery.status}</span>
          {data.delivery.delivery_ref ? ` • Ref: ${data.delivery.delivery_ref}` : ""}
        </p>
      ) : null}
    </div>
  ) : null;

  const paymentCard = data ? (
    <div className="jimat-card p-4">
      <p className="text-sm font-semibold text-foreground">Payment</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-medium text-foreground capitalize">{data.order.payment_status}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Method</p>
          <p className="text-sm font-medium text-foreground">
            {formatPaymentMethodLabel(data.order.payment_method)}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  const refundCard = data?.order.status === "completed" ? (() => {
    const completedDate = data.delivery?.delivery_date 
      ? new Date(data.delivery.delivery_date) 
      : new Date(data.order.updated_at);
    
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - completedDate.getTime()) / (1000 * 3600 * 24));
    const isWithin7Days = daysDifference < 7;
    const hasRefund = Boolean(data.order.refund_status);

    if (hasRefund) {
      let statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
      if (data.order.refund_status === "approved" || data.order.refund_status === "refunded") {
        statusColor = "bg-green-100 text-green-800 border-green-200";
      } else if (data.order.refund_status === "rejected") {
        statusColor = "bg-red-100 text-red-800 border-red-200";
      }

      return (
        <div className="jimat-card p-4">
          <p className="text-sm font-semibold text-foreground">Refund Information</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Request Status</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${statusColor}`}>
              {data.order.refund_status}
            </span>
          </div>
        </div>
      );
    }

    if (isWithin7Days) {
      return (
        <div className="jimat-card p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">Need a refund?</p>
          <p className="text-xs text-muted-foreground">
            You are within the 7-day refund window for this completed order.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/orders/${data.order.id}/refund`)}
            className="mt-2 w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-xl text-sm transition-colors text-center font-semibold"
            data-testid="request-refund-btn"
          >
            Request Refund
          </button>
        </div>
      );
    }

    return null;
  })() : null;

  const shippingCard = shippingLines.length ? (
    <div className="jimat-card p-4">
      <p className="text-sm font-semibold text-foreground">Shipping address</p>
      <div className="mt-2 space-y-1">
        {shippingLines.map((line) => (
          <p key={line} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    </div>
  ) : null;

  const itemsCard = data ? (
    <div className="jimat-card p-4">
      <p className="text-sm font-semibold text-foreground">Items</p>
      <div className="mt-3 space-y-3">
        {data.items.map((it) => {
          const inv = data.inventoryMap.get(it.buyer_inventory_id);
          const prod = inv ? data.productMap.get(inv.product_id) : undefined;
          const name = prod?.name ?? "Item";
          const imgUrl = resolveProductImageUrl(prod) ?? "/placeholder.svg";
          const unit = asNumber(it.unit_price);
          const subtotal = asNumber(it.subtotal);

          return (
            <div key={it.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  <img src={imgUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {it.quantity} • Unit: {formatMYR(unit)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">{formatMYR(subtotal)}</p>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background pb-24">
          <Header />
          <main className="px-4 py-4">
            {orderHeader}
            {!user ? (
              <div className="jimat-card p-4">
                <p className="text-sm text-muted-foreground">Please sign in to view order details.</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                <div className="jimat-card p-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-3 h-4 w-28" />
                </div>
                <div className="jimat-card p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-3 h-16 w-full" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="jimat-card p-4">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="mt-2 h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ) : isError || !data ? (
              <div className="jimat-card p-4">
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "Failed to load order."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {summaryCard}
                {paymentCard}
                {refundCard}
                {shippingCard}
                {itemsCard}
              </div>
            )}
          </main>
          <BottomNav />
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background pb-28">
          <Header />
          <TabletContainer>
            <main className="py-6 space-y-6">
              {orderHeader}
              {!user ? (
                <div className="jimat-card p-4">
                  <p className="text-sm text-muted-foreground">Please sign in to view order details.</p>
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8 space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                  <div className="col-span-4 space-y-3">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                </div>
              ) : isError || !data ? (
                <div className="jimat-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Failed to load order."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-6 items-start">
                  {/* Left Column */}
                  <div className="col-span-8 space-y-4">
                    {itemsCard}
                    {shippingCard}
                  </div>
                  {/* Right Column */}
                  <div className="col-span-4 space-y-4">
                    {summaryCard}
                    {paymentCard}
                    {refundCard}
                  </div>
                </div>
              )}
            </main>
          </TabletContainer>
          <BottomNav />
        </div>
      }
    />
  );
}


