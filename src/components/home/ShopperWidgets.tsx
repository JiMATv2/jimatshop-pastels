import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchShopperSummary } from "@/lib/api/shopperSummary";
import { cn } from "@/lib/utils";
import { Clock, ShoppingBag, Ticket, Truck, Wallet, ChevronRight } from "lucide-react";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";

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

export function ShopperWidgets() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shopper-summary", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not signed in");
      return await fetchShopperSummary({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const totalOrders = data?.totalOrders ?? 0;
  const totalSpend = data?.totalSpend ?? 0;
  const processingOrders = data?.processingOrders ?? 0;
  const availableVouchers = data?.availableVouchers ?? 0;
  const latestShippingStatus = data?.latestShippingStatus ?? "No active shipping";

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
      title: "Vouchers",
      value: `${availableVouchers}`,
      subtitle: "redeemable",
      Icon: Ticket,
      gradient: "",
      iconBg: "bg-primary",
    },
  ];

  const shippingWidget: Widget = {
    title: "Shipping",
    value: latestShippingStatus,
    subtitle: "latest status",
    Icon: Truck,
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
        {widgets.map((w) => (
          <div
            key={w.title}
            className={cn(
              "relative overflow-hidden rounded-2xl p-4 bg-white border-2 border-primary",
              w.gradient
            )}
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
        ))}
      </div>

      {/* Shipping status - full width */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-4 bg-white border-2 border-primary",
          shippingWidget.gradient
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", shippingWidget.iconBg)}>
            <shippingWidget.Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">{shippingWidget.title}</p>
            <p className="text-base font-semibold text-foreground truncate">{shippingWidget.value}</p>
            <p className="text-xs text-muted-foreground">{shippingWidget.subtitle}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}
