import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/lib/cart/CartProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { createMobileJimatshopOrder } from "@/lib/api/mobileOrders";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemCount, subtotal, setQuantity, removeItem, clear } = useCart();
  const { buyerIds, isLoading: buyerIdsLoading, hasLocation } = useNearbyBuyerIds();
  const [submitting, setSubmitting] = useState(false);
  
  // Determine buyer ID(s) from cart items or fall back to nearby buyers
  // Group items by buyerId to handle multi-buyer orders
  const itemsByBuyer = React.useMemo(() => {
    const grouped = new Map<string, typeof items>();
    
    items.forEach(item => {
      const buyerId = item.buyerId;
      if (buyerId) {
        if (!grouped.has(buyerId)) {
          grouped.set(buyerId, []);
        }
        grouped.get(buyerId)!.push(item);
      } else {
        // Items without buyerId go into a special group
        if (!grouped.has('__no_buyer__')) {
          grouped.set('__no_buyer__', []);
        }
        grouped.get('__no_buyer__')!.push(item);
      }
    });
    
    return grouped;
  }, [items]);
  
  // Use buyerId from cart items if all items have the same buyer, otherwise use first nearby buyer
  const primaryBuyerId = React.useMemo(() => {
    const buyersWithItems = Array.from(itemsByBuyer.keys()).filter(k => k !== '__no_buyer__');
    if (buyersWithItems.length === 1) {
      return buyersWithItems[0];
    }
    // Fall back to first nearby buyer if items don't have buyer info or have multiple buyers
    return buyerIds.length > 0 ? buyerIds[0] : null;
  }, [itemsByBuyer, buyerIds]);

  // Buyer IDs that will actually be used when creating orders at checkout.
  const checkoutBuyerIds = React.useMemo(() => {
    const ids = new Set<string>();

    for (const key of itemsByBuyer.keys()) {
      if (key !== "__no_buyer__") ids.add(key);
    }

    const itemsWithoutBuyer = itemsByBuyer.get("__no_buyer__") || [];
    if (itemsWithoutBuyer.length > 0 && primaryBuyerId) {
      ids.add(primaryBuyerId);
    }

    if (ids.size === 0 && primaryBuyerId) {
      ids.add(primaryBuyerId);
    }

    return Array.from(ids);
  }, [itemsByBuyer, primaryBuyerId]);

  // Subtotal per buyer (for coin sufficiency checks when checkout creates multiple orders).
  const subtotalByBuyer = React.useMemo(() => {
    const m = new Map<string, number>();

    const add = (buyerId: string, amount: number) => {
      m.set(buyerId, (m.get(buyerId) ?? 0) + amount);
    };

    items.forEach((it) => {
      const buyerId = it.buyerId || primaryBuyerId;
      if (!buyerId) return;
      add(buyerId, (it.unitPrice || 0) * (it.quantity || 0));
    });

    return m;
  }, [items, primaryBuyerId]);

  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "pay_in_store" | "jimatshop_coins" | "jimatshop_coins_platform" | "billplz"
  >("pay_in_store");

  const { data: shopperId } = useQuery({
    queryKey: ["checkout-shopper-id", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return await resolveShopperId({ authUserId: user.id, email: user.email });
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  type BuyerCoinBalance = {
    buyer_id: string;
    balance: number;
    buyer?: { business_name?: string | null } | null;
  };

  const { data: coinBalances = [], isLoading: isCoinLoading } = useQuery({
    queryKey: ["checkout-coin-balances", shopperId ?? null, checkoutBuyerIds.join(",")],
    queryFn: async () => {
      if (!shopperId) return [] as BuyerCoinBalance[];
      if (checkoutBuyerIds.length === 0) return [] as BuyerCoinBalance[];

      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("buyer_id, balance, buyer:buyers(business_name)")
        .eq("shopper_id", shopperId)
        .in("buyer_id", checkoutBuyerIds);
      if (error) throw error;

      return ((data as any[]) || []).map((row) => {
        const raw = (row as any)?.balance;
        const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;
        return {
          buyer_id: String((row as any)?.buyer_id),
          balance: Number.isFinite(n) ? n : 0,
          buyer: (row as any)?.buyer ?? null,
        } satisfies BuyerCoinBalance;
      });
    },
    enabled: Boolean(shopperId),
    staleTime: 15_000,
  });

  const { data: platformCoinBalance = 0, isLoading: isPlatformCoinLoading } = useQuery({
    queryKey: ["checkout-platform-coin-balance", shopperId ?? null],
    queryFn: async () => {
      if (!shopperId) return 0;
      const { data, error } = await supabase
        .from("jimatshop_coins")
        .select("balance")
        .eq("shopper_id", shopperId)
        .is("buyer_id", null)
        .maybeSingle();
      if (error) throw error;

      const raw = (data as any)?.balance;
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;
      return Number.isFinite(n) ? n : 0;
    },
    enabled: Boolean(shopperId),
    staleTime: 15_000,
  });

  const coinBalanceByBuyer = React.useMemo(() => {
    const m = new Map<string, number>();
    coinBalances.forEach((c) => m.set(c.buyer_id, c.balance));
    return m;
  }, [coinBalances]);

  const buyerNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    coinBalances.forEach((c) => {
      const name = c.buyer?.business_name;
      if (name) m.set(c.buyer_id, name);
    });
    return m;
  }, [coinBalances]);

  const totalCoinBalance = React.useMemo(() => {
    let sum = 0;
    for (const b of coinBalanceByBuyer.values()) sum += b;
    return sum;
  }, [coinBalanceByBuyer]);

  const coinsSufficientIfSelected = React.useMemo(() => {
    for (const [buyerId, buyerSubtotal] of subtotalByBuyer.entries()) {
      const bal = coinBalanceByBuyer.get(buyerId) ?? 0;
      if (bal < buyerSubtotal) return false;
    }
    return true;
  }, [subtotalByBuyer, coinBalanceByBuyer]);

  const platformCoinsSufficient = React.useMemo(() => {
    if (paymentMethod !== "jimatshop_coins_platform") return true;
    return platformCoinBalance >= subtotal;
  }, [paymentMethod, platformCoinBalance, subtotal]);

  const coinsSufficient =
    paymentMethod === "jimatshop_coins"
      ? coinsSufficientIfSelected
      : paymentMethod === "jimatshop_coins_platform"
        ? platformCoinsSufficient
        : true;

  const coinsBalanceLoading =
    Boolean(user && shopperId) &&
    (paymentMethod === "jimatshop_coins"
      ? isCoinLoading
      : paymentMethod === "jimatshop_coins_platform"
        ? isPlatformCoinLoading
        : false);

  const canCheckout =
    Boolean(primaryBuyerId) &&
    items.length > 0 &&
    Boolean(user) &&
    !submitting &&
    !buyerIdsLoading &&
    !coinsBalanceLoading &&
    hasLocation &&
    (paymentMethod !== "jimatshop_coins" || coinsSufficientIfSelected) &&
    (paymentMethod !== "jimatshop_coins_platform" || platformCoinsSufficient);

  const checkoutBlockers = React.useMemo(() => {
    const blockers: string[] = [];

    if (!user) blockers.push("Sign in to place an order.");
    if (items.length === 0) blockers.push("Your cart is empty.");
    if (buyerIdsLoading) {
      blockers.push("Loading nearby shops...");
    } else if (!hasLocation) {
      blockers.push("Please set your location to checkout.");
    } else if (!primaryBuyerId) {
      blockers.push("No nearby shops found. Please update your location.");
    }

    if (user && !shopperId) {
      blockers.push("Preparing your shopper profile...");
    } else if (coinsBalanceLoading) {
      blockers.push("Loading coin balance...");
    } else if (paymentMethod === "jimatshop_coins" && !coinsSufficientIfSelected) {
      blockers.push("Insufficient JiMATShop coins for this order.");
    } else if (paymentMethod === "jimatshop_coins_platform" && !platformCoinsSufficient) {
      const shortfall = subtotal - platformCoinBalance;
      blockers.push(
        shortfall > 0
          ? `Insufficient platform coins (need ${formatMYR(shortfall)} more).`
          : "Insufficient platform coins for this order.",
      );
    }

    return blockers;
  }, [
    user,
    items.length,
    buyerIdsLoading,
    hasLocation,
    primaryBuyerId,
    shopperId,
    coinsBalanceLoading,
    paymentMethod,
    coinsSufficientIfSelected,
    platformCoinsSufficient,
    subtotal,
    platformCoinBalance,
  ]);

  const onCheckout = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to place an order." });
      return;
    }
    if (!primaryBuyerId || !hasLocation) {
      toast({ 
        title: "Location required", 
        description: "Please set your location to see nearby shops and checkout." 
      });
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
    if (paymentMethod === "jimatshop_coins_platform" && !platformCoinsSufficient) {
      toast({
        title: "Insufficient platform coins",
        description: "Your platform JiMATShop coin balance is not enough to cover this order.",
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

      // Group items by buyer and create separate orders for each buyer
      const buyersWithItems = Array.from(itemsByBuyer.entries()).filter(([buyerId]) => buyerId !== '__no_buyer__');
      const itemsWithoutBuyer = itemsByBuyer.get('__no_buyer__') || [];
      
      const ordersToCreate: Array<{ buyerId: string; items: typeof items }> = [];
      
      // Add orders for items with buyer info
      buyersWithItems.forEach(([buyerId, buyerItems]) => {
        ordersToCreate.push({ buyerId, items: buyerItems });
      });
      
      // Add order for items without buyer info (use primary buyer)
      if (itemsWithoutBuyer.length > 0 && primaryBuyerId) {
        ordersToCreate.push({ buyerId: primaryBuyerId, items: itemsWithoutBuyer });
      }
      
      // If no items have buyer info, create single order with primary buyer
      if (ordersToCreate.length === 0 && primaryBuyerId) {
        ordersToCreate.push({ buyerId: primaryBuyerId, items });
      }
      
      if (ordersToCreate.length === 0) {
        toast({
          title: "Checkout failed",
          description: "Unable to determine buyer for order items.",
          variant: "destructive",
        });
        return;
      }

      // Billplz redirect can only handle a single bill URL cleanly.
      // For now, require single-shop checkout when Billplz is selected.
      if (paymentMethod === "billplz" && ordersToCreate.length > 1) {
        toast({
          title: "Billplz checkout",
          description: "Please checkout one shop at a time when paying by Billplz.",
          variant: "destructive",
        });
        return;
      }

      // Create orders for each buyer
      const orderResults = await Promise.allSettled(
        ordersToCreate.map(({ buyerId, items: buyerItems }) =>
          createMobileJimatshopOrder({
            buyer_id: buyerId,
            shopper_id: resolvedShopperId,
            items: buyerItems.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
            // Pickup-only for now
            shipping_address: null,
            notes: notes.trim() || null,
            payment_method: paymentMethod,
          })
        )
      );

      // Check for failures
      const failures = orderResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      if (failures.length > 0) {
        const errorMsg = failures[0].status === 'fulfilled' 
          ? (failures[0].value as any).message || (failures[0].value as any).error || "Unable to place order."
          : "Failed to create order";
        toast({
          title: "Checkout failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // Get successful order IDs
      const successfulOrders = orderResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success)
        .map(r => r.value.data);

      clear();

      // If Billplz is selected and backend returned a bill URL, redirect to payment.
      if (paymentMethod === "billplz") {
        const billUrl = successfulOrders?.[0]?.billplz_url as string | null | undefined;
        if (billUrl) {
          toast({ title: "Redirecting to Billplz", description: "Complete your payment to confirm the order." });
          window.location.href = billUrl;
          return;
        }
        // If billUrl is missing, backend did not generate a bill URL (treat as an error, but keep the order created).
        toast({
          title: "Billplz checkout",
          description: "Billplz URL is missing. Please try again or contact support.",
          variant: "destructive",
        });
      }
      
      if (successfulOrders.length === 1) {
        toast({
          title: "Order placed",
          description: `Order #${successfulOrders[0].jimatshop_order_id.slice(0, 8)} created.`,
        });
        navigate(`/orders/${successfulOrders[0].jimatshop_order_id}`);
      } else {
        toast({
          title: "Orders placed",
          description: `${successfulOrders.length} order(s) created successfully.`,
        });
        // Navigate to first order or orders list
        navigate(`/orders/${successfulOrders[0].jimatshop_order_id}`);
      }
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

        {!hasLocation || buyerIdsLoading ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">
              {buyerIdsLoading ? "Loading nearby shops..." : "Please set your location to checkout."}
            </p>
          </div>
        ) : !primaryBuyerId ? (
          <div className="jimat-card p-4">
            <p className="text-sm text-muted-foreground">
              No nearby shops found. Please update your location.
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
          <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pay_in_store">Pay in store</SelectItem>
              <SelectItem
                value="jimatshop_coins"
                disabled={!user || (shopperId && !isCoinLoading && !coinsSufficientIfSelected)}
              >
                JiMATShop Coins
              </SelectItem>
              <SelectItem value="jimatshop_coins_platform" disabled={!user}>
                JiMATShop Coins (Platform)
              </SelectItem>
              <SelectItem value="billplz" disabled={!user}>
                Billplz
              </SelectItem>
            </SelectContent>
          </Select>

          {paymentMethod === "jimatshop_coins" ? (
            <p className="text-xs text-muted-foreground">
              Coins will be deducted from your JiMATShop coin balance when you place the order.
            </p>
          ) : paymentMethod === "jimatshop_coins_platform" ? (
            <p className="text-xs text-muted-foreground">
              Coins will be deducted from your platform JiMATShop coin balance when you place the order.
            </p>
          ) : paymentMethod === "billplz" ? (
            <p className="text-xs text-muted-foreground">
              You'll be redirected to Billplz to complete payment after placing the order.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Pay at the shop counter when you pick up your order.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {user ? (
              shopperId ? (
                isCoinLoading || isPlatformCoinLoading ? (
                  "Loading coin balance..."
                ) : (
                  <>
                    JiMATShop coins available: <span className="font-semibold">{formatMYR(totalCoinBalance)}</span>
                    <span className="block mt-1">
                      Platform coins available: <span className="font-semibold">{formatMYR(platformCoinBalance)}</span>
                      {paymentMethod === "jimatshop_coins_platform" && !platformCoinsSufficient ? (
                        <span className="text-destructive"> (insufficient)</span>
                      ) : null}
                    </span>
                    {checkoutBuyerIds.length > 1 ? (
                      <span className="block mt-1">
                        {checkoutBuyerIds.map((buyerId) => (
                          <span key={buyerId} className="block">
                            {buyerNameById.get(buyerId) || buyerId.slice(0, 8)}:{" "}
                            <span className="font-semibold">{formatMYR(coinBalanceByBuyer.get(buyerId) ?? 0)}</span>
                          </span>
                        ))}
                      </span>
                    ) : null}
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
          {!canCheckout && !submitting && checkoutBlockers.length > 0 ? (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
              <p className="text-xs font-medium text-destructive">Cannot place order yet:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                {checkoutBlockers.map((reason) => (
                  <li key={reason} className="text-xs text-destructive/90">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}


