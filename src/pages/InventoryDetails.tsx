import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetchMobileInventoryById, type MobileInventory } from "@/lib/api/mobileInventories";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart/CartProvider";

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export default function InventoryDetails() {
  const { inventoryId } = useParams<{ inventoryId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inv, setInv] = useState<MobileInventory | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!inventoryId) {
      setError("Inventory ID is required");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetchMobileInventoryById(inventoryId);
        if (!resp.success || !resp.data) throw new Error(resp.message || "Inventory not found");
        setInv(resp.data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load inventory";
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [inventoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading inventory…</p>
        </div>
      </div>
    );
  }

  if (error || !inv) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4">
          <p className="text-destructive text-center">{error || "Inventory not found"}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (inv.stock_level <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addItem(
      {
        productId: inv.product_id,
        name: inv.product_name,
        image: inv.cover_image_url || undefined,
        unitLabel: `${inv.buyer_name}`,
        unitPrice: inv.retail_price,
      },
      quantity
    );
    
    toast({
      title: "Added to cart",
      description: `${quantity}x ${inv.product_name} added to your cart`,
    });
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < inv.stock_level) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: "Maximum quantity reached",
        description: `Only ${inv.stock_level} items available in stock.`,
        variant: "destructive",
      });
    }
  };

  const isOutOfStock = inv.stock_level <= 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <main className="px-4 py-4 space-y-4">
        <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
          <img
            src={inv.cover_image_url || "https://via.placeholder.com/400"}
            alt={inv.product_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Buyer</div>
          <div className="text-base font-semibold text-foreground">{inv.buyer_name}</div>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Product</div>
          <div className="text-lg font-bold text-foreground">{inv.product_name}</div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            {formatMYR(inv.retail_price)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="jimat-card p-3">
            <div className="text-xs text-muted-foreground">Stock</div>
            <div className={`text-base font-bold ${isOutOfStock ? "text-destructive" : "text-foreground"}`}>
              {inv.stock_level}
            </div>
          </div>
          <div className="jimat-card p-3">
            <div className="text-xs text-muted-foreground">Sold (nearby)</div>
            <div className="text-base font-bold text-foreground">{inv.total_quantity_sold}</div>
          </div>
          <div className="jimat-card p-3">
            <div className="text-xs text-muted-foreground">Orders</div>
            <div className="text-base font-bold text-foreground">{inv.total_orders}</div>
          </div>
          <div className="jimat-card p-3">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className={`text-base font-bold ${isOutOfStock ? "text-destructive" : "text-green-600"}`}>
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Add to Cart */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 space-y-3">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Quantity</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={increaseQuantity}
              disabled={quantity >= inv.stock_level}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full h-12 text-base gap-2" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="w-5 h-5" />
          {isOutOfStock ? "Out of Stock" : `Add to Cart · ${formatMYR(inv.retail_price * quantity)}`}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}


