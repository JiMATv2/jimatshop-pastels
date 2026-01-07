import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Clock, ShoppingBag, Ticket, Truck, Wallet } from "lucide-react";
import type { ComponentType } from "react";

type Widget = {
  title: string;
  value: string;
  subtitle?: string;
  Icon: ComponentType<{ className?: string }>;
  accentClassName: string;
};

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export function ShopperWidgets() {
  const { user } = useAuth();

  // TODO: replace with real data (Supabase / API) once endpoints are ready.
  const totalOrders = 0;
  const totalSpend = 0;
  const processingOrders = 0;
  const availableVouchers = 0;
  const latestShippingStatus = "Tiada penghantaran aktif";

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
    },
  ];

  return (
    <section className="px-4 py-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground">Ringkasan</h3>
        {!user ? <span className="text-xs text-muted-foreground">Log masuk untuk statistik</span> : null}
      </div>

      <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-1">
        {widgets.map((w) => (
          <div key={w.title} className="jimat-card min-w-[240px] flex-shrink-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{w.title}</p>
                <p
                  className={cn(
                    "mt-1 text-lg font-bold text-foreground leading-tight break-words",
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


