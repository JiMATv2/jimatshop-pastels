import * as React from "react";
import { toast } from "@/hooks/use-toast";
import type { CartItem, CartStateV1 } from "./cartTypes";
import { getSelectedBuyerShopId } from "@/lib/shop/selectedBuyerShop";

type CartContextValue = {
  buyerId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function keyForBuyer(buyerId: string | null) {
  return `jimatshop_cart_v1:${buyerId ?? "none"}`;
}

function safeParse(json: string | null): CartStateV1 | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json) as CartStateV1;
    if (!v || v.version !== 1 || !Array.isArray(v.items)) return null;
    return v;
  } catch {
    return null;
  }
}

function normalizeQty(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(999, Math.floor(qty)));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [buyerId, setBuyerId] = React.useState<string | null>(() => getSelectedBuyerShopId());
  const [items, setItems] = React.useState<CartItem[]>([]);

  // Keep buyerId in sync with selection changes from other screens (localStorage write).
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jimatshop_selected_buyer_shop_id") {
        setBuyerId(getSelectedBuyerShopId());
      }
    };
    const onBuyerChanged = () => setBuyerId(getSelectedBuyerShopId());
    window.addEventListener("storage", onStorage);
    window.addEventListener("jimatshop:selectedBuyerShopChanged", onBuyerChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("jimatshop:selectedBuyerShopChanged", onBuyerChanged as EventListener);
    };
  }, []);

  // Load cart for current buyer when buyerId changes.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(keyForBuyer(buyerId));
      const parsed = safeParse(raw);
      setItems(parsed?.items ?? []);
    } catch {
      setItems([]);
    }
  }, [buyerId]);

  // Persist.
  React.useEffect(() => {
    try {
      const state: CartStateV1 = {
        version: 1,
        buyerId,
        items,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(keyForBuyer(buyerId), JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [buyerId, items]);

  const addItem = React.useCallback(
    (item: Omit<CartItem, "quantity">, qty: number = 1) => {
      if (!buyerId) {
        toast({
          title: "Select a shop first",
          description: "Please choose a shop before adding items to cart.",
        });
        return;
      }

      const addQty = normalizeQty(qty);

      setItems((prev) => {
        const idx = prev.findIndex((p) => p.productId === item.productId);
        if (idx === -1) return [...prev, { ...item, quantity: addQty }];
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: normalizeQty(next[idx].quantity + addQty) };
        return next;
      });

      toast({
        title: "Added to cart",
        description: `${item.name} ×${addQty}`,
      });
    },
    [buyerId],
  );

  const setQuantity = React.useCallback((productId: string, qty: number) => {
    const q = Math.max(0, Math.min(999, Math.floor(qty)));
    setItems((prev) => {
      if (q <= 0) return prev.filter((p) => p.productId !== productId);
      return prev.map((p) => (p.productId === productId ? { ...p, quantity: q } : p));
    });
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const itemCount = React.useMemo(() => items.reduce((sum, it) => sum + (it.quantity || 0), 0), [items]);
  const subtotal = React.useMemo(
    () => items.reduce((sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 0), 0),
    [items],
  );

  const value: CartContextValue = React.useMemo(
    () => ({
      buyerId,
      items,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [buyerId, items, itemCount, subtotal, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider />");
  return ctx;
}


