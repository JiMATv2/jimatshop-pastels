import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart/CartProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { createMobileJimatshopOrder } from "@/lib/api/mobileOrders";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buyerId, items, itemCount, subtotal, setQuantity, removeItem, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pay_in_store" | "jimatshop_coins">("pay_in_store");

  const { data: shopperId } = useQuery({
    queryKey: ["checkout-shopper-id", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return await resolveShopperId({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const { data: coinBalance = null, isLoading: isCoinLoading } = useQuery({
    queryKey: ["checkout-coin-balance", shopperId ?? null],
    queryFn: async () => {
      if (!shopperId) return null as number | null;
      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("balance")
        .eq("shopper_id", shopperId)
        .maybeSingle();
      if (error) throw error;
      const raw = (data as any)?.balance;
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;
      return Number.isFinite(n) ? n : 0;
    },
    enabled: Boolean(shopperId),
    staleTime: 15_000,
  });

  const coinsSufficient = paymentMethod !== "jimatshop_coins" ? true : (coinBalance ?? 0) >= subtotal;

  const canCheckout =
    Boolean(buyerId) &&
    items.length > 0 &&
    Boolean(user) &&
    !submitting &&
    (paymentMethod !== "jimatshop_coins" || coinsSufficient);

  const onCheckout = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to place an order." });
      return;
    }
    if (!buyerId) {
      toast({ title: "Select a shop", description: "Please choose a shop before checkout." });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Your cart is empty", description: "Add items to cart before checkout." });
      return;
    }
    if (paymentMethod === "jimatshop_coins" && !coinsSufficient) {
      toast({
        title: "Insufficient coins",
        description: "Your JiMATShop coin balance is not enough to cover this order.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const resolvedShopperId =
        shopperId ?? (await resolveShopperId({ authUserId: user.id, email: user.email }));
      if (!resolvedShopperId) {
        toast({
          title: "Profile not ready",
          description: "We couldn't find your shopper profile yet. Please sign out and sign in again.",
        });
        return;
      }

      const resp = await createMobileJimatshopOrder({
        buyer_id: buyerId,
        shopper_id: resolvedShopperId,
        items: items.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
        // Pickup-only for now
        shipping_address: null,
        notes: notes.trim() || null,
        payment_method: paymentMethod,
      });

      if (!resp.success) {
        toast({
          title: "Checkout failed",
          description: resp.message || resp.error || "Unable to place order.",
          variant: "destructive",
        });
        return;
      }

      clear();
      toast({
        title: "Order placed",
        description: `Order #${resp.data.jimatshop_order_id.slice(0, 8)} created.`,
      });
      navigate(`/orders/${resp.data.jimatshop_order_id}`);
    } catch (e: any) {
      toast({
        title: "Checkout failed",
        description: e?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Checkout</h2>
          <Button variant="outline" size="sm" onClick={() => clear()} disabled={items.length === 0}>
            Clear
          </Button>
        </div>

        {!buyerId ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">
              Please select a shop first (from Shops) before adding items to cart.
            </p>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button className="mt-3" onClick={() => navigate("/products")}>
              Browse products
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.productId} className="jimat-card p-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-2">{it.name}</p>
                        {it.unitLabel ? (
                          <p className="text-xs text-muted-foreground mt-0.5">{it.unitLabel}</p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeItem(it.productId)}
                        aria-label={`Remove ${it.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-primary">{formatMYR(it.unitPrice)}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(it.productId, it.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm w-6 text-center">{it.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(it.productId, it.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Line total: {formatMYR(it.unitPrice * it.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="jimat-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Delivery Method</h3>
          <div className="flex gap-2">
            <Button type="button" variant="default" className="flex-1">
              Self pickup (default)
            </Button>
            <Button type="button" variant="outline" className="flex-1" disabled>
              Delivery (disabled)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Delivery is currently unavailable. Your order will be prepared for self pickup.
          </p>
        </div>

        <div className="jimat-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Payment Method</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={paymentMethod === "pay_in_store" ? "default" : "outline"}
              onClick={() => setPaymentMethod("pay_in_store")}
            >
              Pay in store
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "jimatshop_coins" ? "default" : "outline"}
              onClick={() => setPaymentMethod("jimatshop_coins")}
              disabled={!user || (coinBalance != null && coinBalance < subtotal)}
            >
              Pay by JiMATShop coins
            </Button>
          </div>
          {paymentMethod === "jimatshop_coins" ? (
            <p className="text-xs text-muted-foreground">
              Coins will be deducted from your JiMATShop coin balance when you place the order.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Pay at the shop counter when you pick up your order.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {user ? (
              shopperId ? (
                isCoinLoading ? (
                  "Loading coin balance..."
                ) : (
                  <>
                    JiMATShop coins balance: <span className="font-semibold">{formatMYR(coinBalance ?? 0)}</span>
                    {paymentMethod === "jimatshop_coins" && !coinsSufficient ? (
                      <span className="text-destructive"> (insufficient)</span>
                    ) : null}
                  </>
                )
              ) : (
                "Sign-in is ready; preparing shopper profile..."
              )
            ) : (
              "Sign in to view your JiMATShop coin balance."
            )}
          </p>
        </div>

        <div className="jimat-card p-4 space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions?"
          />
        </div>

        <div className="jimat-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Items ({itemCount})
            </p>
            <p className="text-sm font-semibold text-foreground">{formatMYR(subtotal)}</p>
          </div>

          <Button className="w-full mt-4" onClick={onCheckout} disabled={!canCheckout}>
            {submitting ? "Placing order..." : `Place order · ${formatMYR(subtotal)}`}
          </Button>
          {!user ? (
            <p className="mt-2 text-xs text-muted-foreground">Sign in to place an order.</p>
          ) : null}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}


