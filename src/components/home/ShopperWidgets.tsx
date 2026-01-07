import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchShopperSummary } from "@/lib/api/shopperSummary";
import { cn } from "@/lib/utils";
import { Clock, ShoppingBag, Ticket, Truck, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";

type Widget = {
  title: string;
  value: string;
  subtitle?: string;
  Icon: ComponentType<{ className?: string }>;
  accentClassName: string;
  valueClassName?: string;
};

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export function ShopperWidgets() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shopper-summary", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not signed in");
      return await fetchShopperSummary(user.id);
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
      title: "Bilangan pesanan keseluruhan",
      value: `${totalOrders}`,
      subtitle: user ? "Jumlah pesanan anda" : "Log masuk untuk data sebenar",
      Icon: ShoppingBag,
      accentClassName: "bg-jimat-pastelsage",
    },
    {
      title: "Nilai pembelian terkumpul",
      value: formatMYR(totalSpend),
      subtitle: user ? "Jumlah pembelian anda" : "Log masuk untuk data sebenar",
      Icon: Wallet,
      accentClassName: "bg-jimat-pastelpeach",
    },
    {
      title: "Pesanan yang sedang diproses",
      value: `${processingOrders}`,
      subtitle: user ? "Dalam proses / disediakan" : "Log masuk untuk data sebenar",
      Icon: Clock,
      accentClassName: "bg-jimat-pastelblue",
    },
    {
      title: "Baucar atau kupon tersedia",
      value: `${availableVouchers}`,
      subtitle: user ? "Boleh digunakan semasa checkout" : "Log masuk untuk data sebenar",
      Icon: Ticket,
      accentClassName: "bg-jimat-pastellavender",
    },
    {
      title: "Status penghantaran terkini",
      value: latestShippingStatus,
      subtitle: user ? "Kemaskini terakhir" : "Log masuk untuk data sebenar",
      Icon: Truck,
      accentClassName: "bg-muted",
      valueClassName: "text-base",
    },
  ];

  return (
    <section className="px-4 py-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground">Ringkasan</h3>
        {!user ? (
          <span className="text-xs text-muted-foreground">Log masuk untuk statistik</span>
        ) : isLoading ? (
          <span className="text-xs text-muted-foreground">Memuatkan...</span>
        ) : isError ? (
          <span className="text-xs text-muted-foreground">Gagal memuat</span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {widgets.map((w, idx) => (
          <div
            key={w.title}
            className={cn(
              "jimat-card p-4",
              idx === widgets.length - 1 ? "col-span-2 md:col-span-2 xl:col-span-1" : "",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{w.title}</p>
                <p
                  className={cn(
                    "mt-1 text-lg font-bold text-foreground leading-tight break-words",
                    w.valueClassName,
                    !user && "text-muted-foreground",
                  )}
                >
                  {w.value}
                </p>
                {w.subtitle ? <p className="mt-1 text-xs text-muted-foreground">{w.subtitle}</p> : null}
              </div>

              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", w.accentClassName)}>
                <w.Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


