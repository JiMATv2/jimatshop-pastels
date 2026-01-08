import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchMobileBuyerShops } from "@/lib/api/mobileBuyers";
import { useSelectedBuyerShop } from "@/lib/shop/selectedBuyerShop";
import { useNavigate } from "react-router-dom";

export default function Shops() {
  const navigate = useNavigate();
  const { buyerId, setBuyerId } = useSelectedBuyerShop();
  const [q, setQ] = useState("");
  const search = useMemo(() => q.trim(), [q]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mobile-buyer-shops", search],
    queryFn: async () =>
      fetchMobileBuyerShops({
        page: 1,
        limit_count: 50,
        search_query: search,
        only_activated: false,
        min_product_count: 1,
      }),
    staleTime: 60_000,
  });

  const shops = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-foreground">Buyer Shops</h2>
          {buyerId ? (
            <span className="text-xs text-muted-foreground">Selected</span>
          ) : (
            <span className="text-xs text-muted-foreground">Pick a shop</span>
          )}
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search shop name / city / state"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="jimat-card p-3 flex gap-3 items-center">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load shops.</p>
        ) : shops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shops found.</p>
        ) : (
          <div className="space-y-3">
            {shops.map((s) => {
              const selected = buyerId === s.id;
              const subtitle = [s.city, s.state].filter(Boolean).join(", ");
              const img = s.shop_photo_url || s.signboard_photo_url || "/placeholder.svg";
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setBuyerId(s.id);
                    navigate("/", { replace: true });
                  }}
                  className={`w-full text-left jimat-card p-3 flex gap-3 items-center transition-colors ${
                    selected ? "border border-primary" : ""
                  }`}
                >
                  <img src={img} alt={s.business_name} className="h-14 w-14 rounded-xl object-cover bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{s.business_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {subtitle || "—"} · {s.product_count} products
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary">{selected ? "Selected" : "Select"}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


