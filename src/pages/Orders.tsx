import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type OrderRow = {
  id: string;
  status: string;
  total_amount: unknown;
  created_at: string;
  outlet_name?: string | null;
  items?: Array<{
    name: string;
    quantity: number;
    inventoryId?: string | null;
    imageUrl?: string | null;
  }>;
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

type OrderStatusTab = "all" | "pending" | "processing" | "ready" | "completed" | "cancelled" | "other";

function toTabKey(status: string): OrderStatusTab {
  if (status === "pending") return "pending";
  if (status === "processing") return "processing";
  if (status === "ready") return "ready";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "other";
}

function formatTabLabel(tab: OrderStatusTab): string {
  if (tab === "all") return "All";
  if (tab === "pending") return "Pending";
  if (tab === "processing") return "Processing";
  if (tab === "ready") return "Ready";
  if (tab === "completed") return "Completed";
  if (tab === "cancelled") return "Cancelled";
  return "Other";
}

function formatOrderItems(items: OrderRow["items"]): string | null {
  if (!items || items.length === 0) return null;
  const maxItems = 3;
  const parts = items
    .slice(0, maxItems)
    .map((item) => `${item.name} x${item.quantity}`);
  const remaining = items.length - maxItems;
  return remaining > 0 ? `${parts.join(", ")} +${remaining} more` : parts.join(", ");
}

function OrdersList({ orders, showCompletedDetails }: { orders: OrderRow[]; showCompletedDetails: boolean }) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="jimat-card p-4">
        <p className="text-sm text-muted-foreground">No orders in this status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link
          key={o.id}
          to={`/orders/${o.id}`}
          className="jimat-card p-4 block hover:shadow-md transition-shadow"
          aria-label={`View order ${o.id}`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground truncate">Order #{o.id.slice(0, 8)}</p>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(o.status)} className="capitalize">
                {o.status}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          {showCompletedDetails ? (
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              {o.outlet_name ? <p className="truncate">Outlet: {o.outlet_name}</p> : null}
              {o.items && o.items.length > 0 ? (
                <div className="space-y-2">
                  {o.items.map((item, idx) => (
                    <div key={`${o.id}-${idx}`} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="h-10 w-10 rounded-md object-cover bg-muted"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                      </div>
                      {item.inventoryId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            navigate(`/inventory/${item.inventoryId}`);
                          }}
                        >
                          Buy again
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="truncate">Items: {formatOrderItems(o.items)}</p>
              )}
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("ms-MY", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }).format(new Date(o.created_at))}
            </p>
            <p className="text-sm font-bold text-primary">{formatMYR(asNumber(o.total_amount))}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as OrderStatusTab | null;

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["shopper-orders", user?.id],
    queryFn: async () => {
      if (!user) return [] as OrderRow[];

      const shopperId = await resolveShopperId({ authUserId: user.id, email: user.email });
      if (!shopperId) return [] as OrderRow[];

      const { data, error } = await supabase
        .from("jimatshop_orders")
        .select(
          `
            id,
            status,
            total_amount,
            created_at,
            buyers (
              business_name,
              outlet_name
            ),
            jimatshop_order_items (
              quantity,
              buyer_inventory_id,
              buyer_inventories (
                products (
                  name,
                  image_url,
                  cover_image_url
                )
              )
            )
          `,
        )
        .eq("shopper_id", shopperId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []).map((row: any) => {
        const outletName = row?.buyers?.business_name || row?.buyers?.outlet_name || null;
        const items = (row?.jimatshop_order_items ?? [])
          .map((item: any) => {
            const product = item?.buyer_inventories?.products;
            const name = product?.name;
            if (!name) return null;
            return {
              name,
              quantity: Number(item?.quantity ?? 0),
              inventoryId: item?.buyer_inventory_id ?? null,
              imageUrl: product?.cover_image_url || product?.image_url || null,
            };
          })
          .filter(Boolean);

        return {
          id: row.id,
          status: row.status,
          total_amount: row.total_amount,
          created_at: row.created_at,
          outlet_name: outletName,
          items,
        } as OrderRow;
      });
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const grouped = useMemo(() => {
    const base: Record<OrderStatusTab, OrderRow[]> = {
      all: orders,
      pending: [],
      processing: [],
      ready: [],
      completed: [],
      cancelled: [],
      other: [],
    };

    for (const o of orders) {
      base[toTabKey(o.status)].push(o);
    }
    return base;
  }, [orders]);

  const tabs: OrderStatusTab[] = useMemo(() => {
    const hasAny = (k: OrderStatusTab) => grouped[k].length > 0;
    const ordered: OrderStatusTab[] = ["all", "pending", "processing", "ready", "completed", "cancelled", "other"];
    // Keep "all" always, hide empty status tabs for a cleaner UI.
    return ordered.filter((k) => k === "all" || hasAny(k));
  }, [grouped]);

  // Determine default tab: use URL param if valid, otherwise "all"
  const defaultTab = useMemo(() => {
    if (tabFromUrl && tabs.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return "all";
  }, [tabFromUrl, tabs]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Orders</h2>
          {!user ? <span className="text-xs text-muted-foreground">Sign in to see your orders</span> : null}
        </div>

        {!user ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to view your order history.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="jimat-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Failed to load orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="-mx-4 px-4 overflow-x-auto pb-2">
              <TabsList className="w-max">
                {tabs.map((t) => (
                  <TabsTrigger key={t} value={t} className="gap-2">
                    <span>{formatTabLabel(t)}</span>
                    <span className="text-xs text-muted-foreground">{grouped[t].length}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((t) => (
              <TabsContent key={t} value={t} className="mt-3">
                <OrdersList orders={grouped[t]} showCompletedDetails={t === "completed"} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


