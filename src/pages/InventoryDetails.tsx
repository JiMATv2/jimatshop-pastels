import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { fetchMobileInventoryById, type MobileInventory } from "@/lib/api/mobileInventories";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart/CartProvider";
import { CartIconButton } from "@/components/cart/CartIconButton";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";

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
        <StickyHeader>
          <div className="flex items-center justify-between px-4 py-3 safe-area-x">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </StickyHeader>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4">
          <p className="text-destructive text-center">{error || "Inventory not found"}</p>
          <Button onClick={() => navigate(-1)} data-testid="go-back-btn">Go Back</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const unitPrice =
    inv.promotion_price != null && inv.promotion_price > 0 ? inv.promotion_price : inv.retail_price;

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
        unitPrice,
        buyerId: inv.buyer_id,
        buyerInventoryId: inv.inventory_id,
        buyerName: inv.buyer_name,
      },
      quantity
    );
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

  const productImage = (
    <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
      <img
        src={inv.cover_image_url || "https://via.placeholder.com/400"}
        alt={inv.product_name}
        className="w-full h-full object-cover"
      />
    </div>
  );

  const viewSellerButton = (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 h-8 text-xs w-full sm:w-auto"
      onClick={() => navigate(`/products?buyer_id=${inv.buyer_id}`)}
      data-testid="view-seller-btn"
    >
      <Store className="w-3.5 h-3.5" />
      View Seller
    </Button>
  );

  const productInfo = (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">{inv.buyer_name}</p>
        <h1 className="text-xl font-bold text-foreground mt-1">{inv.product_name}</h1>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">{formatMYR(unitPrice)}</span>
        {inv.promotion_price != null &&
          inv.promotion_price > 0 &&
          inv.promotion_price !== inv.retail_price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatMYR(inv.retail_price)}
            </span>
          )}
      </div>
    </div>
  );

  const statsCards = (
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
  );

  const quantitySelector = (
    <div className="flex items-center justify-between py-2 px-4 border rounded-xl bg-card">
      <span className="text-sm font-medium text-foreground">Quantity</span>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          data-testid="decrease-qty-btn"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-lg font-semibold w-8 text-center" data-testid="quantity-display">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={increaseQuantity}
          disabled={quantity >= inv.stock_level}
          data-testid="increase-qty-btn"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const addToCartButtonInline = (
    <Button
      className="w-full h-12 text-base gap-2"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      data-testid="add-to-cart-button"
    >
      <ShoppingCart className="w-5 h-5" />
      {isOutOfStock ? "Out of Stock" : `Add to Cart · ${formatMYR(unitPrice * quantity)}`}
    </Button>
  );

  return (
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background pb-bottom-nav">
          <StickyHeader>
            <div className="flex items-center justify-between px-4 py-3 safe-area-x">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="back-btn-mobile">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CartIconButton />
            </div>
          </StickyHeader>

          <main className="px-4 py-4 space-y-6 safe-area-x mx-8">
            {productImage}

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">{inv.buyer_name}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => navigate(`/products?buyer_id=${inv.buyer_id}`)}
                      data-testid="view-seller-btn-mobile"
                    >
                      <Store className="w-3.5 h-3.5" />
                      View Seller
                    </Button>
                  </div>
                  <h1 className="text-xl font-bold text-foreground mt-1">{inv.product_name}</h1>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{formatMYR(unitPrice)}</span>
                {inv.promotion_price != null &&
                  inv.promotion_price > 0 &&
                  inv.promotion_price !== inv.retail_price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatMYR(inv.retail_price)}
                    </span>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3" style={{ paddingBottom: "160px" }}>
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
          <div className="fixed bottom-nav-offset left-0 right-0 bg-background border-t p-4 space-y-3 safe-area-x safe-area-bottom mb-6">
            <div className="flex items-center justify-between px-8">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  data-testid="decrease-qty-btn-mobile"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center" data-testid="quantity-display-mobile">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={increaseQuantity}
                  disabled={quantity >= inv.stock_level}
                  data-testid="increase-qty-btn-mobile"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="px-8">
              <Button
                className="w-full h-12 text-base gap-2"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                data-testid="add-to-cart-button-mobile"
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? "Out of Stock" : `Add to Cart · ${formatMYR(unitPrice * quantity)}`}
              </Button>
            </div>
          </div>

          <BottomNav />
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background pb-28">
          <StickyHeader>
            <div className="flex items-center justify-between px-4 py-3 safe-area-x">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="back-btn-tablet">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CartIconButton />
            </div>
          </StickyHeader>

          <TabletContainer>
            <main className="py-6">
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Left Column - Media & Seller Actions */}
                <div className="col-span-5 space-y-6">
                  {productImage}
                  <div className="flex flex-col gap-2">
                    {viewSellerButton}
                  </div>
                </div>

                {/* Right Column - Product details, stock stats & buying options */}
                <div className="col-span-7 space-y-6">
                  {productInfo}
                  {statsCards}
                  <div className="p-4 border rounded-2xl bg-card/50 space-y-4">
                    {quantitySelector}
                    {addToCartButtonInline}
                  </div>
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



