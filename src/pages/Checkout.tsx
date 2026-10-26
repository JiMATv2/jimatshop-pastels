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
import { Minus, Plus, Trash2, Store, AlertCircle, Coins, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
  const [applyCoins, setApplyCoins] = useState<boolean>(true);
  const [usePlatformCoins, setUsePlatformCoins] = useState<boolean>(false);
  const [remainderPaymentMethod, setRemainderPaymentMethod] = useState<
    "online_banking" | "pay_in_store"
  >("online_banking");

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
    checkoutBuyerIds.forEach((id) => {
      sum += coinBalanceByBuyer.get(id) ?? 0;
    });
    return sum;
  }, [checkoutBuyerIds, coinBalanceByBuyer]);

  const activeCoinsAvailable = usePlatformCoins ? platformCoinBalance : totalCoinBalance;

  const { totalCoinsApplied, remainingBalance, coinsAppliedByBuyer } = React.useMemo(() => {
    let totalApplied = 0;
    const appliedMap = new Map<string, number>();

    if (!applyCoins || activeCoinsAvailable <= 0) {
      return { totalCoinsApplied: 0, remainingBalance: subtotal, coinsAppliedByBuyer: appliedMap };
    }

    if (usePlatformCoins) {
      let remPlat = Math.min(platformCoinBalance, subtotal);
      totalApplied = remPlat;
      for (const [buyerId, bSub] of subtotalByBuyer.entries()) {
        const canUse = Math.min(remPlat, bSub);
        appliedMap.set(buyerId, canUse);
        remPlat -= canUse;
      }
    } else {
      for (const [buyerId, bSub] of subtotalByBuyer.entries()) {
        const bal = coinBalanceByBuyer.get(buyerId) ?? 0;
        const applied = Math.min(bal, bSub);
        appliedMap.set(buyerId, applied);
        totalApplied += applied;
      }
    }

    const rem = Math.max(0, subtotal - totalApplied);
    return {
      totalCoinsApplied: totalApplied,
      remainingBalance: rem,
      coinsAppliedByBuyer: appliedMap,
    };
  }, [applyCoins, activeCoinsAvailable, usePlatformCoins, platformCoinBalance, subtotal, subtotalByBuyer, coinBalanceByBuyer]);

  const isOnlinePayment = remainingBalance > 0.001 && remainderPaymentMethod === "online_banking";

  const coinsBalanceLoading =
    Boolean(user && shopperId) && (isCoinLoading || isPlatformCoinLoading);

  const canCheckout =
    Boolean(primaryBuyerId) &&
    items.length > 0 &&
    Boolean(user) &&
    !submitting &&
    !buyerIdsLoading &&
    !coinsBalanceLoading &&
    hasLocation;

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

      if (ordersToCreate.length > 1) {
        // Multi-shop checkout: create orders for all shops with a single online payment bill
        const ordersPayload = ordersToCreate.map(({ buyerId, items: buyerItems }) => {
          const buyerSub = subtotalByBuyer.get(buyerId) || 0;
          const coinsToUse = applyCoins ? (coinsAppliedByBuyer.get(buyerId) || 0) : 0;
          return {
            buyer_id: buyerId,
            items: buyerItems.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
            use_coins: coinsToUse > 0 && !usePlatformCoins,
            use_platform_coins: coinsToUse > 0 && usePlatformCoins,
            coins_amount: coinsToUse,
            notes: notes.trim() || null,
          };
        });

        const effectivePaymentMethod =
          remainingBalance <= 0.001
            ? (usePlatformCoins ? "jimatshop_coins_platform" : "jimatshop_coins")
            : remainderPaymentMethod;

        const res = await createMobileJimatshopOrder({
          shopper_id: resolvedShopperId,
          orders: ordersPayload,
          shipping_address: null,
          notes: notes.trim() || null,
          payment_method: effectivePaymentMethod,
          ...(effectivePaymentMethod === "online_banking" && remainingBalance > 0
            ? {
                redirect_base: getPaymentRedirectBase(),
                billplz_redirect_base: getPaymentRedirectBase(),
              }
            : {}),
        });

        if (!res.success) {
          const errorMsg =
            (res as any).message || (res as any).error || "Unable to place orders.";
          toast({
            title: "Checkout failed",
            description: errorMsg,
            variant: "destructive",
          });
          return;
        }

        clear();

        const data = res.data;
        if (isOnlinePayment && (data.payment_url || data.billplz_url)) {
          const paymentUrl = data.payment_url || data.billplz_url;
          toast({ title: "Redirecting to payment", description: "Complete your single payment for all orders." });
          await openPaymentGateway(paymentUrl!, data.jimatshop_order_id);
          return;
        }

        toast({
          title: "Orders placed",
          description: `${ordersToCreate.length} orders created successfully.`,
        });
        navigate(`/orders/${data.jimatshop_order_id}`);
        return;
      }

      // Single shop order
      const singleOrder = ordersToCreate[0];
      const buyerSub = subtotalByBuyer.get(singleOrder.buyerId) || 0;
      const coinsToUse = applyCoins ? (coinsAppliedByBuyer.get(singleOrder.buyerId) || 0) : 0;
      const shopRemaining = Math.max(0, buyerSub - coinsToUse);

      const effectivePaymentMethod =
        shopRemaining <= 0.001
          ? (usePlatformCoins ? "jimatshop_coins_platform" : "jimatshop_coins")
          : remainderPaymentMethod;

      const singleRes = await createMobileJimatshopOrder({
        buyer_id: singleOrder.buyerId,
        shopper_id: resolvedShopperId,
        items: singleOrder.items.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
        shipping_address: null,
        notes: notes.trim() || null,
        use_coins: coinsToUse > 0 && !usePlatformCoins,
        use_platform_coins: coinsToUse > 0 && usePlatformCoins,
        coins_amount: coinsToUse,
        payment_method: effectivePaymentMethod,
        ...(effectivePaymentMethod === "online_banking" && shopRemaining > 0
          ? {
              redirect_base: getPaymentRedirectBase(),
              billplz_redirect_base: getPaymentRedirectBase(),
            }
          : {}),
      });

      if (!singleRes.success) {
        const errorMsg =
          (singleRes as any).message || (singleRes as any).error || "Unable to place order.";
        toast({
          title: "Checkout failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      clear();

      if (isOnlinePayment) {
        const paymentUrl = singleRes.data.payment_url || singleRes.data.billplz_url;
        if (paymentUrl) {
          const orderId = singleRes.data.jimatshop_order_id;
          toast({ title: "Redirecting to payment", description: "Complete your payment to confirm the order." });
          await openPaymentGateway(paymentUrl, orderId);
          return;
        }
        toast({
          title: "Online checkout",
          description: "Payment URL is missing. Please try again or contact support.",
          variant: "destructive",
        });
      }

      toast({
        title: "Order placed",
        description: `Order ${formatJimatshopOrderNumber(singleRes.data.jimatshop_order_id)} created.`,
      });
      navigate(`/orders/${singleRes.data.jimatshop_order_id}`);
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
    <div className="jimat-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Payment Method</h3>

      {/* JiMATShop Coins deduction card */}
      {user && shopperId && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                <Coins className="w-4 h-4 text-primary" />
                <span>Apply JiMATShop Coins</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeCoinsAvailable > 0
                  ? `Deduct coins from your available balance (${formatMYR(activeCoinsAvailable)})`
                  : "No coins available for the items in your cart"}
              </p>
            </div>
            <Switch
              checked={applyCoins && activeCoinsAvailable > 0}
              onCheckedChange={(val) => setApplyCoins(val)}
              disabled={activeCoinsAvailable <= 0}
              aria-label="Toggle apply JiMATShop coins"
            />
          </div>

          {/* Breakdown per outlet */}
          {checkoutBuyerIds.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
              <div className="font-medium text-muted-foreground pb-0.5">
                {checkoutBuyerIds.length > 1 ? "Outlet Coin Balances:" : "Shop Coin Balance:"}
              </div>
              {checkoutBuyerIds.map((buyerId) => {
                const bal = coinBalanceByBuyer.get(buyerId) ?? 0;
                const req = subtotalByBuyer.get(buyerId) ?? 0;
                const name = buyerNameById.get(buyerId) || buyerId.slice(0, 8);
                const applied = applyCoins && !usePlatformCoins ? (coinsAppliedByBuyer.get(buyerId) ?? 0) : 0;
                return (
                  <div key={buyerId} className="flex items-center justify-between py-0.5">
                    <span className="truncate pr-2 text-foreground font-medium">{name}:</span>
                    <span className="shrink-0 text-right">
                      <span className="font-semibold text-foreground">{formatMYR(bal)}</span>
                      {applied > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold ml-1.5">
                          (-{formatMYR(applied)} applied)
                        </span>
                      ) : (
                        <span className="text-muted-foreground ml-1.5">(subtotal {formatMYR(req)})</span>
                      )}
                    </span>
                  </div>
                );
              })}

              {platformCoinBalance > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-border/20 text-xs">
                  <span className="font-medium text-foreground">Platform Coins:</span>
                  <span className="shrink-0">
                    <span className="font-semibold text-foreground">{formatMYR(platformCoinBalance)}</span>
                    {applyCoins && usePlatformCoins && totalCoinsApplied > 0 && (
                      <span className="text-green-600 dark:text-green-400 font-semibold ml-1.5">
                        (-{formatMYR(totalCoinsApplied)} applied)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {applyCoins && totalCoinsApplied > 0 && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 flex items-center justify-between text-xs text-green-700 dark:text-green-400">
              <span className="font-medium">JiMATShop Coins Applied:</span>
              <span className="font-bold">-{formatMYR(totalCoinsApplied)}</span>
            </div>
          )}
        </div>
      )}

      {/* Remaining Payment Method selection */}
      {remainingBalance > 0.001 ? (
        <div className="space-y-2 pt-1">
          <Label className="text-xs font-semibold text-foreground">
            {totalCoinsApplied > 0
              ? `Pay Remaining Balance (${formatMYR(remainingBalance)}) via:`
              : "Select Payment Method:"}
          </Label>
          <Select
            value={remainderPaymentMethod}
            onValueChange={(v) => setRemainderPaymentMethod(v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online_banking" disabled={!user}>
                Online Banking / FPX (Billplz / Chip-in)
              </SelectItem>
              <SelectItem value="pay_in_store">Pay at Shop Counter (Cash / In-store)</SelectItem>
            </SelectContent>
          </Select>

          {remainderPaymentMethod === "online_banking" ? (
            <p className="text-xs text-muted-foreground">
              {totalCoinsApplied > 0
                ? `You'll be redirected to complete online banking for the remaining ${formatMYR(remainingBalance)}.`
                : "You'll be redirected to complete secure online banking payment."}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {totalCoinsApplied > 0
                ? `Pay the remaining ${formatMYR(remainingBalance)} at the shop counter when picking up.`
                : "Pay at the shop counter when you pick up your order."}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            100% covered by JiMATShop Coins. No additional payment required!
          </span>
        </div>
      )}

      {!user ? (
        <p className="text-xs text-muted-foreground">Sign in to view your JiMATShop coin balance.</p>
      ) : isShopperLoading ? (
        <p className="text-xs text-muted-foreground">Loading shopper profile...</p>
      ) : isShopperError ? (
        <div className="space-y-2">
          <p className="text-xs text-destructive">
            {shopperError instanceof Error ? shopperError.message : "Couldn't load your shopper profile."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => void refetchShopperId()}
          >
            Retry
          </Button>
        </div>
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-semibold text-foreground">{formatMYR(subtotal)}</span>
        </div>
        {totalCoinsApplied > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
            <span>JiMATShop Coins</span>
            <span className="font-semibold">-{formatMYR(totalCoinsApplied)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
          <span className="text-foreground">Total to Pay</span>
          <span className="text-primary">{formatMYR(remainingBalance)}</span>
        </div>
      </div>

      <Button className="w-full" onClick={onCheckout} disabled={!canCheckout}>
        {submitting
          ? "Placing order..."
          : remainingBalance > 0.001
            ? `Place order · Pay ${formatMYR(remainingBalance)}`
            : "Place order · Paid with Coins"}
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


