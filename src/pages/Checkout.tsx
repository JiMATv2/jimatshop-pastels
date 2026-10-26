import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/lib/cart/CartProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ensureShopperId } from "@/lib/api/shopper";
import { createMobileJimatshopOrder } from "@/lib/api/mobileOrders";
import { getPaymentRedirectBase } from "@/lib/payments/billplzRedirect";
import { openPaymentGateway } from "@/lib/payments/openBillplzPayment";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Minus, Plus, Trash2, Store, AlertCircle } from "lucide-react";
import { useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";
import { formatJimatshopOrderNumber } from "@/lib/orders/formatOrderNumber";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemCount, subtotal, setQuantity, removeItem, clear } = useCart();
  const { buyerIds, outlets, isLoading: buyerIdsLoading, hasLocation } = useNearbyBuyerIds();
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
    "pay_in_store" | "jimatshop_coins" | "jimatshop_coins_platform" | "online_banking" | "billplz"
  >("pay_in_store");

  const isOnlinePayment = paymentMethod === "online_banking" || paymentMethod === "billplz";

  const {
    data: shopperId,
    isLoading: isShopperLoading,
    isError: isShopperError,
    error: shopperError,
    refetch: refetchShopperId,
  } = useQuery({
    queryKey: ["checkout-shopper-id", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      return await ensureShopperId(user);
    },
    enabled: Boolean(user),
    staleTime: 60_000,
    retry: 1,
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

  const { data: buyersData = [] } = useQuery({
    queryKey: ["checkout-buyers", checkoutBuyerIds.join(",")],
    queryFn: async () => {
      if (checkoutBuyerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("buyers")
        .select("id, business_name, address")
        .in("id", checkoutBuyerIds);
      if (error) return [];
      return (data as any[]) ?? [];
    },
    enabled: checkoutBuyerIds.length > 0,
    staleTime: 60_000,
  });

  const coinBalanceByBuyer = React.useMemo(() => {
    const m = new Map<string, number>();
    coinBalances.forEach((c) => m.set(c.buyer_id, c.balance));
    return m;
  }, [coinBalances]);

  const buyerNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    outlets.forEach((o) => {
      const id = typeof o.id === "string" ? o.id : String(o.id);
      if (id && o.name) m.set(id, o.name);
    });
    buyersData.forEach((b: any) => {
      if (b?.id && b?.business_name) m.set(String(b.id), b.business_name);
    });
    coinBalances.forEach((c) => {
      const name = c.buyer?.business_name;
      if (name) m.set(c.buyer_id, name);
    });
    items.forEach((it) => {
      if (it.buyerId && it.buyerName) {
        if (!m.has(it.buyerId)) m.set(it.buyerId, it.buyerName);
      }
    });
    return m;
  }, [outlets, buyersData, coinBalances, items]);

  const totalCoinBalance = React.useMemo(() => {
    let sum = 0;
    for (const b of coinBalanceByBuyer.values()) sum += b;
    return sum;
  }, [coinBalanceByBuyer]);

  const coinsSufficientIfSelected = React.useMemo(() => {
    if (subtotalByBuyer.size === 0) return false;
    for (const [buyerId, buyerSubtotal] of subtotalByBuyer.entries()) {
      const bal = coinBalanceByBuyer.get(buyerId) ?? 0;
      if (bal < buyerSubtotal) return false;
    }
    return true;
  }, [subtotalByBuyer, coinBalanceByBuyer]);

  const platformCoinsSufficient = React.useMemo(() => {
    return platformCoinBalance >= subtotal && subtotal > 0;
  }, [platformCoinBalance, subtotal]);

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
      const resolvedShopperId = shopperId ?? (await ensureShopperId(user));
      if (!resolvedShopperId) {
        toast({
          title: "Profile not ready",
          description: "We couldn't set up your shopper profile. Please try again.",
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

      // Online payment redirect can only handle a single bill URL cleanly.
      // For now, require single-shop checkout when online banking is selected.
      if (isOnlinePayment && ordersToCreate.length > 1) {
        toast({
          title: "Online checkout",
          description: "Please checkout one shop at a time when paying via online banking.",
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
            shipping_address: null,
            notes: notes.trim() || null,
            payment_method: paymentMethod,
            ...(isOnlinePayment
              ? {
                  redirect_base: getPaymentRedirectBase(),
                  billplz_redirect_base: getPaymentRedirectBase(),
                }
              : {}),
          }),
        ),
      );

      // Check for failures
      const failures = orderResults.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success),
      );
      if (failures.length > 0) {
        const errorMsg =
          failures[0].status === "fulfilled"
            ? (failures[0].value as { message?: string; error?: string }).message ||
              (failures[0].value as { error?: string }).error ||
              "Unable to place order."
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
        .filter(
          (
            r,
          ): r is PromiseFulfilledResult<{
            success: true;
            data: {
              jimatshop_order_id: string;
              payment_url?: string | null;
              billplz_url?: string | null;
            };
          }> => r.status === "fulfilled" && r.value.success,
        )
        .map((r) => r.value.data);

      clear();

      // If Online Banking is selected and backend returned a payment URL, redirect to payment.
      if (isOnlinePayment) {
        const paymentUrl = successfulOrders?.[0]?.payment_url || successfulOrders?.[0]?.billplz_url;
        if (paymentUrl) {
          const orderId = successfulOrders[0].jimatshop_order_id;
          toast({ title: "Redirecting to payment", description: "Complete your payment to confirm the order." });
          await openPaymentGateway(paymentUrl, orderId);
          return;
        }
        // If payment URL is missing, backend did not generate a payment URL (treat as an error, but keep the order created).
        toast({
          title: "Online checkout",
          description: "Payment URL is missing. Please try again or contact support.",
          variant: "destructive",
        });
      }
      
      if (successfulOrders.length === 1) {
        toast({
          title: "Order placed",
          description: `Order ${formatJimatshopOrderNumber(successfulOrders[0].jimatshop_order_id)} created.`,
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

  const checkoutTitle = (
    <div className="flex items-center justify-between">
      <h2 className="text-lg md:text-xl font-semibold text-foreground">Checkout</h2>
      <Button variant="outline" size="sm" onClick={() => clear()} disabled={items.length === 0}>
        Clear
      </Button>
    </div>
  );

  const locationAlert = (!hasLocation || buyerIdsLoading) ? (
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
  ) : null;

  const cartItemsList = items.length === 0 ? (
    <div className="jimat-card p-4">
      <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      <Button className="mt-3" onClick={() => navigate("/products")}>
        Browse products
      </Button>
    </div>
  ) : (
    <div className="space-y-4">
      {checkoutBuyerIds.map((buyerId) => {
        const buyerItems = items.filter(
          (it) => (it.buyerId || primaryBuyerId) === buyerId
        );
        if (buyerItems.length === 0) return null;
        const shopName =
          buyerNameById.get(buyerId) ||
          buyerItems.find((it) => it.buyerName)?.buyerName ||
          (buyerId ? `Shop ${buyerId.slice(0, 8)}` : "Shop");
        const buyerSub = subtotalByBuyer.get(buyerId) ?? 0;

        return (
          <div key={buyerId} className="space-y-3">
            {checkoutBuyerIds.length > 1 && (
              <div className="flex items-center justify-between px-1 pt-1 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{shopName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Subtotal: <span className="font-semibold text-foreground">{formatMYR(buyerSub)}</span>
                </span>
              </div>
            )}

            {buyerItems.map((it) => (
              <div key={`${it.productId}-${it.buyerId || 'none'}`} className="jimat-card p-3">
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
                        <div className="flex items-center gap-2 mt-0.5">
                          {checkoutBuyerIds.length > 1 && (
                            <span className="text-[11px] text-primary font-medium">{shopName}</span>
                          )}
                          {it.unitLabel ? (
                            <span className="text-xs text-muted-foreground">{it.unitLabel}</span>
                          ) : null}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeItem(it.productId, it.buyerId)}
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
                          onClick={() => setQuantity(it.productId, it.quantity - 1, it.buyerId)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm w-6 text-center">{it.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(it.productId, it.quantity + 1, it.buyerId)}
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
        );
      })}
    </div>
  );

  const deliveryMethodCard = (
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
  );

  const paymentMethodCard = (
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
            disabled={!user || Boolean(shopperId && !isCoinLoading && !coinsSufficientIfSelected)}
          >
            JiMATShop Coins
          </SelectItem>
          <SelectItem
            value="jimatshop_coins_platform"
            disabled={!user || Boolean(shopperId && !isPlatformCoinLoading && !platformCoinsSufficient)}
          >
            JiMATShop Coins (Platform)
          </SelectItem>
          <SelectItem value="online_banking" disabled={!user}>
            Online Banking (FPX)
          </SelectItem>
        </SelectContent>
      </Select>

      {paymentMethod === "jimatshop_coins" ? (
        <p className="text-xs text-muted-foreground">
          Coins will be deducted from your outlet JiMATShop coin balance when you place the order.
        </p>
      ) : paymentMethod === "jimatshop_coins_platform" ? (
        <p className="text-xs text-muted-foreground">
          Coins will be deducted from your platform JiMATShop coin balance when you place the order.
        </p>
      ) : isOnlinePayment ? (
        <p className="text-xs text-muted-foreground">
          You'll be redirected to complete secure online banking payment after placing the order.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Pay at the shop counter when you pick up your order.
        </p>
      )}

      <div className="text-xs text-muted-foreground">
        {!user ? (
          "Sign in to view your JiMATShop coin balance."
        ) : isShopperLoading ? (
          "Loading shopper profile..."
        ) : isShopperError ? (
          <span className="text-destructive">
            {shopperError instanceof Error
              ? shopperError.message
              : "Couldn't load your shopper profile."}
          </span>
        ) : shopperId ? (
          isCoinLoading || isPlatformCoinLoading ? (
            "Loading coin balance..."
          ) : (
            <div className="space-y-2 pt-1">
              {checkoutBuyerIds.length > 1 ? (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Multi-shop order ({checkoutBuyerIds.length} shops)</span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    JiMATShop coins are outlet-specific. To pay with coins, each shop in this order must have sufficient coin balance.
                  </p>
                </div>
              ) : null}

              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-semibold text-foreground">
                  {checkoutBuyerIds.length > 1 ? "Outlet Coins (for this order):" : "JiMATShop Coins Available:"}
                </div>
                {checkoutBuyerIds.map((buyerId) => {
                  const bal = coinBalanceByBuyer.get(buyerId) ?? 0;
                  const req = subtotalByBuyer.get(buyerId) ?? 0;
                  const ok = bal >= req;
                  const name = buyerNameById.get(buyerId) || buyerId.slice(0, 8);
                  return (
                    <div key={buyerId} className="flex items-center justify-between text-xs py-0.5">
                      <span className="truncate pr-2 font-medium">{name}:</span>
                      <span className="shrink-0 text-right">
                        <span className="font-semibold">{formatMYR(bal)}</span>
                        <span className="text-muted-foreground"> (order {formatMYR(req)})</span>
                        {!ok ? (
                          <span className="text-destructive font-medium ml-1.5">· insufficient</span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium ml-1.5">· sufficient</span>
                        )}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Platform Coins:</span>
                  <span className="shrink-0">
                    <span className="font-semibold">{formatMYR(platformCoinBalance)}</span>
                    {!platformCoinsSufficient ? (
                      <span className="text-destructive font-medium ml-1.5">· insufficient</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 font-medium ml-1.5">· sufficient</span>
                    )}
                  </span>
                </div>
              </div>

              {!coinsSufficientIfSelected && !platformCoinsSufficient ? (
                <p className="text-[11px] text-muted-foreground italic pt-1">
                  Coin payment unavailable for this cart. Select "Pay in store" to pay at the counter, or remove items from outlets with insufficient coins.
                </p>
              ) : null}
            </div>
          )
        ) : (
          "Shopper profile not found."
        )}
      </div>
      {user && isShopperError ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => void refetchShopperId()}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );

  const notesCard = (
    <div className="jimat-card p-4 space-y-2">
      <Label htmlFor="notes">Notes (optional)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any special instructions?"
      />
    </div>
  );

  const summaryCard = (
    <div className="jimat-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Items ({itemCount})
        </p>
        <p className="text-sm font-semibold text-foreground">{formatMYR(subtotal)}</p>
      </div>

      <Button className="w-full" onClick={onCheckout} disabled={!canCheckout}>
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
  );

  return (
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background pb-24">
          <Header />
          <main className="px-4 py-4 space-y-4">
            {checkoutTitle}
            {locationAlert}
            {cartItemsList}
            {items.length > 0 && (
              <>
                {deliveryMethodCard}
                {paymentMethodCard}
                {notesCard}
                {summaryCard}
              </>
            )}
          </main>
          <BottomNav />
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background pb-28">
          <Header />
          <TabletContainer>
            <main className="py-6 space-y-6">
              {checkoutTitle}
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Left Panel */}
                <div className="col-span-8 space-y-4">
                  {locationAlert}
                  {cartItemsList}
                  {items.length > 0 && (
                    <>
                      {deliveryMethodCard}
                      {paymentMethodCard}
                      {notesCard}
                    </>
                  )}
                </div>

                {/* Right Panel */}
                <div className="col-span-4 sticky top-20">
                  {items.length > 0 && summaryCard}
                </div>
              </div>
            </main>
          </TabletContainer>
          <BottomNav />
        </div>
      }
    />
  );
}


