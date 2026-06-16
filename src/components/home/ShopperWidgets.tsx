import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchShopperSummary } from "@/lib/api/shopperSummary";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Clock, ShoppingBag, Coins, Package, Wallet, ChevronRight } from "lucide-react";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type Widget = {
  title: string;
  value: string;
  subtitle?: string;
  Icon: ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
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

export function ShopperWidgets() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
    queryKey: ["shopper-summary", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not signed in");
      return await fetchShopperSummary({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const { data: coinsTotal = 0, isLoading: isCoinsLoading } = useQuery({
    queryKey: ["shopper-jimatshop-coins-total", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const shopperId = await resolveShopperId({ authUserId: user.id, email: user.email });
      if (!shopperId) return 0;

      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("balance")
        .eq("shopper_id", shopperId);

      if (error) throw error;
      return (data ?? []).reduce((sum, r) => sum + asNumber(r.balance), 0);
    },
    enabled: Boolean(user),
    staleTime: 15_000,
  });

  const totalOrders = summaryData?.totalOrders ?? 0;
  const totalSpend = summaryData?.totalSpend ?? 0;
  const processingOrders = summaryData?.processingOrders ?? 0;
  const readyForPickupOrders = summaryData?.readyForPickupOrders ?? 0;

  const widgets: Widget[] = [
    {
      title: "Orders",
      value: `${totalOrders}`,
      subtitle: "total orders",
      Icon: ShoppingBag,
      gradient: "",
      iconBg: "bg-primary",
    },
    {
      title: "Purchases",
      value: formatMYR(totalSpend),
      subtitle: "total spent",
      Icon: Wallet,
      gradient: "",
      iconBg: "bg-primary",
    },
    {
      title: "Processing",
      value: `${processingOrders}`,
      subtitle: "active orders",
      Icon: Clock,
      gradient: "",
      iconBg: "bg-primary",
    },
    {
      title: "JiMATSHOP Coins",
      value: formatMYR(coinsTotal),
      subtitle: "total balance",
      Icon: Coins,
      gradient: "",
      iconBg: "bg-primary",
    },
  ];

  const readyForPickupWidget: Widget = {
    title: "Ready for Pickup",
    value: `${readyForPickupOrders}`,
    subtitle: readyForPickupOrders === 1 ? "order ready" : "orders ready",
    Icon: Package,
    gradient: "",
    iconBg: "bg-primary",
  };

  if (!user) {
    return (
      <section className="px-4 py-4">
        <div className="bg-white border-2 border-primary rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 text-foreground">Welcome!</h3>
              <p className="text-sm text-muted-foreground">
                Sign in to view your purchase summary
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
        </div>
      </section>
    );
  }

  const isLoading = isSummaryLoading || isCoinsLoading;
  const isError = isSummaryError;

  return (
    <section className="px-4 py-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground">Summary</h3>
        {isLoading ? (
          <span className="text-xs text-muted-foreground">Loading...</span>
        ) : isError ? (
          <span className="text-xs text-destructive">Failed to load</span>
        ) : null}
      </div>

      {/* Main 4 widgets in 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {widgets.map((w) => {
          const isOrdersWidget = w.title === "Orders";
          const isCoinsWidget = w.title === "JiMATSHOP Coins";

          const commonProps = isOrdersWidget
            ? {
                onClick: () => navigate("/orders"),
                role: "button",
                tabIndex: 0,
                onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate("/orders");
                  }
                },
                "aria-label": "View order history",
              }
            : isCoinsWidget
              ? {
                  onClick: () => navigate("/jimatshop-coins"),
                  role: "button",
                  tabIndex: 0,
                  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate("/jimatshop-coins");
                    }
                  },
                  "aria-label": "View JiMATSHOP coins",
                }
              : {};

          return (
            <div
              key={w.title}
              className={cn(
                "relative overflow-hidden rounded-2xl p-4 bg-white border-2 border-primary",
                (isOrdersWidget || isCoinsWidget) && "cursor-pointer hover:shadow-md transition-shadow",
                w.gradient
              )}
              {...commonProps}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground mb-1">{w.title}</p>
                  <p className="text-xl font-bold text-foreground truncate">{w.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{w.subtitle}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", w.iconBg)}>
                  <w.Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ready for Pickup - full width */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-4 bg-white border-2 border-primary cursor-pointer hover:shadow-md transition-shadow",
          readyForPickupWidget.gradient
        )}
        onClick={() => navigate("/orders?tab=ready")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate("/orders?tab=ready");
          }
        }}
        aria-label="View orders ready for pickup"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", readyForPickupWidget.iconBg)}>
            <readyForPickupWidget.Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">{readyForPickupWidget.title}</p>
            <p className="text-base font-semibold text-foreground truncate">{readyForPickupWidget.value}</p>
            <p className="text-xs text-muted-foreground">{readyForPickupWidget.subtitle}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}
