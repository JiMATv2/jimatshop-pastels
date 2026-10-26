import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CoinRow = {
  id: string;
  buyer_id: string | null;
  balance: unknown;
  updated_at: string;
  buyer?: { business_name?: string | null } | null;
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

export default function JimatshopCoins() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shopper-jimatshop-coins", user?.id],
    queryFn: async () => {
      if (!user) return { rows: [] as CoinRow[], total: 0 };

      const shopperId = await resolveShopperId({ authUserId: user.id, email: user.email });
      if (!shopperId) return { rows: [] as CoinRow[], total: 0 };

      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("id,buyer_id,balance,updated_at,buyer:buyers(business_name)")
        .eq("shopper_id", shopperId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as CoinRow[];
      const total = rows.reduce((sum, r) => sum + asNumber(r.balance), 0);
      return { rows, total };
    },
    enabled: Boolean(user),
    staleTime: 15_000,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">JiMATShop Coins</h2>
          {!user ? <span className="text-xs text-muted-foreground">Sign in to view</span> : null}
        </div>

        {!user ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Please sign in to view your coin balances.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <div className="jimat-card p-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-40 mt-3" />
            </div>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="jimat-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-32 mt-3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Failed to load coin balances.</p>
          </div>
        ) : (
          <>
            <div className="jimat-card p-4">
              <p className="text-sm text-muted-foreground">Total coins available</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatMYR(data?.total ?? 0)}</p>
            </div>

            {data?.rows?.length ? (
              <div className="space-y-3">
                {data.rows.map((r) => {
                  const name = r.buyer?.business_name || (r.buyer_id ? `Shop ${r.buyer_id.slice(0, 8)}` : "JiMATShop Platform Coins");
                  return (
                    <button
                      key={r.id}
                      className="w-full text-left jimat-card p-4 transition-colors hover:bg-muted/50 active:bg-muted"
                      onClick={() => navigate(`/jimatshop-coins/${r.id}`)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                        <div className="flex items-center gap-2">
                          {r.buyer_id ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/products?buyer_id=${r.buyer_id}`);
                              }}
                            >
                              <Store className="w-4 h-4" />
                              Go to shop
                            </Button>
                          ) : null}
                          <p className="text-sm font-bold text-primary">{formatMYR(asNumber(r.balance))}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated{" "}
                        {new Intl.DateTimeFormat("ms-MY", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }).format(new Date(r.updated_at))}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="jimat-card p-4">
                <p className="text-sm text-muted-foreground">No coin balances found yet.</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


