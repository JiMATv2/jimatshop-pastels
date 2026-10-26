import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Store } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

type CoinRow = {
  id: string;
  buyer_id: string | null;
  balance: unknown;
  updated_at: string;
  buyer?: { business_name?: string | null } | null;
};

type TxRow = {
  id: string;
  coin_id: string | null;
  before_amount: unknown;
  amount: unknown;
  after_amount: unknown;
  remarks: string | null;
  created_at: string;
  jimatshop_order_id: string | null;
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

export default function JimatshopCoinTransactions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coinId } = useParams<{ coinId: string }>();

  const { data: shopperId } = useQuery({
    queryKey: ["coin-tx-shopper-id", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return await resolveShopperId({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const { data: coin, isLoading: coinLoading } = useQuery({
    queryKey: ["coin-tx-coin", shopperId ?? null, coinId ?? null],
    queryFn: async () => {
      if (!shopperId || !coinId) return null as CoinRow | null;
      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("id,buyer_id,balance,updated_at,buyer:buyers(business_name)")
        .eq("shopper_id", shopperId)
        .eq("id", coinId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as CoinRow | null;
    },
    enabled: Boolean(shopperId) && Boolean(coinId),
    staleTime: 15_000,
  });

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["coin-tx-list", shopperId ?? null, coinId ?? null],
    queryFn: async () => {
      if (!shopperId || !coinId) return [] as TxRow[];

      const { data, error } = await supabase
        .from("jimatshop_coin_transactions")
        .select("id,coin_id,before_amount,amount,after_amount,remarks,created_at,jimatshop_order_id")
        .eq("coin_id", coinId)
        .eq("shopper_id", shopperId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as TxRow[];
    },
    enabled: Boolean(shopperId) && Boolean(coinId),
    staleTime: 15_000,
  });

  const title = coin?.buyer?.business_name || (coin?.buyer_id ? `Shop ${coin.buyer_id.slice(0, 8)}` : "Platform Coins Wallet");

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground truncate">{title}</h2>
          </div>

          {coin?.buyer_id ? (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to={`/products?buyer_id=${coin.buyer_id}`}>
                <Store className="w-4 h-4" />
                Go to shop
              </Link>
            </Button>
          ) : null}
        </div>

        {!user ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Please sign in to view your coin transactions.</p>
          </div>
        ) : !coinId ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Missing coin id.</p>
          </div>
        ) : coinLoading ? (
          <div className="space-y-3">
            <div className="jimat-card p-4">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-7 w-40 mt-3" />
            </div>
          </div>
        ) : coin ? (
          <>
            <div className="jimat-card p-4">
              <p className="text-sm text-muted-foreground">Current balance</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatMYR(asNumber(coin.balance))}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Updated{" "}
                {new Intl.DateTimeFormat("ms-MY", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }).format(new Date(coin.updated_at))}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Transactions</h3>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="jimat-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-48 mt-3" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="jimat-card p-4">
                  <p className="text-sm text-muted-foreground">Failed to load transactions.</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="jimat-card p-4">
                  <p className="text-sm text-muted-foreground">No transactions yet.</p>
                </div>
              ) : (
                transactions.map((t) => {
                  const amt = asNumber(t.amount);
                  const sign = amt > 0 ? "+" : "";
                  return (
                    <div key={t.id} className="jimat-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {t.remarks || "Coin transaction"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Intl.DateTimeFormat("ms-MY", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(t.created_at))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${amt < 0 ? "text-destructive" : "text-primary"}`}>
                            {sign}
                            {formatMYR(amt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>Before: {formatMYR(asNumber(t.before_amount))}</span>
                        <span>After: {formatMYR(asNumber(t.after_amount))}</span>
                      </div>

                      {t.jimatshop_order_id ? (
                        <div className="mt-3">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/orders/${t.jimatshop_order_id}`}>View order</Link>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Coin wallet not found.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


