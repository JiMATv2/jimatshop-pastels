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
  const latestShippingStatus = data?.latestShippingStatus ?? "Tiada penghantaran aktif";

  const widgets: Widget[] = [
    {
      title: "Pesanan",
      value: `${totalOrders}`,
      subtitle: "jumlah pesanan",
      Icon: ShoppingBag,
      gradient: "from-jimat-green/20 to-jimat-lightgreen/30",
      iconBg: "bg-jimat-green",
    },
    {
      title: "Pembelian",
      value: formatMYR(totalSpend),
      subtitle: "nilai terkumpul",
      Icon: Wallet,
      gradient: "from-orange-100 to-amber-100",
      iconBg: "bg-orange-500",
    },
    {
      title: "Diproses",
      value: `${processingOrders}`,
      subtitle: "pesanan aktif",
      Icon: Clock,
      gradient: "from-blue-100 to-sky-100",
      iconBg: "bg-blue-500",
    },
    {
      title: "Baucar",
      value: `${availableVouchers}`,
      subtitle: "boleh ditebus",
      Icon: Ticket,
      gradient: "from-purple-100 to-violet-100",
      iconBg: "bg-purple-500",
    },
  ];

  const shippingWidget: Widget = {
    title: "Penghantaran",
    value: latestShippingStatus,
    subtitle: "status terkini",
    Icon: Truck,
    gradient: "from-jimat-pastelsage to-jimat-pastelblue/50",
    iconBg: "bg-jimat-darkgreen",
  };

  if (!user) {
    return (
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-jimat-green to-jimat-darkgreen rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Selamat Datang!</h3>
              <p className="text-sm text-white/80">
                Log masuk untuk lihat ringkasan pembelian anda
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground">Ringkasan</h3>
        {isLoading ? (
          <span className="text-xs text-muted-foreground">Memuatkan...</span>
        ) : isError ? (
          <span className="text-xs text-destructive">Gagal memuat</span>
        ) : null}
      </div>

      {/* Main 4 widgets in 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {widgets.map((w) => (
          <div
            key={w.title}
            className={cn(
              "relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br",
              w.gradient
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">{w.title}</p>
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
          "relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br",
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
