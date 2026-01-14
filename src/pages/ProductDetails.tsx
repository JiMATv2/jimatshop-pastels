import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart/CartProvider";
import { toast } from "@/hooks/use-toast";
import { fetchMobileProductById } from "@/lib/api/mobileProducts";
import { fetchInventoriesForProduct, type MobileInventory } from "@/lib/api/mobileInventories";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: "sale" | "new" | "fast";
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
}

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [inventories, setInventories] = useState<MobileInventory[]>([]);
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { buyerIds } = useNearbyBuyerIds();

  useEffect(() => {
    if (!productId) {
      setError("Product ID is required");
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMobileProductById(productId);
        
        if (response.success && response.data) {
          const apiProduct = response.data;
          
          // Map API response to component's expected structure
          const mappedProduct: Product = {
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.promotion_price ?? apiProduct.normal_price,
            originalPrice: apiProduct.promotion_price ? apiProduct.normal_price : undefined,
            unit: apiProduct.subcategory || "1 unit",
            image: apiProduct.cover_image_url || "https://via.placeholder.com/400",
            badge: apiProduct.is_fast_moving ? "fast" : apiProduct.promotion_price ? "sale" : undefined,
            description: `${apiProduct.name} - ${apiProduct.category}${apiProduct.subcategory ? ` (${apiProduct.subcategory})` : ""}. ${apiProduct.seller_name ? `Sold by ${apiProduct.seller_name}.` : ""}`,
            rating: 4.5, // Default rating since API doesn't provide this
            reviews: apiProduct.total_orders || 0,
            inStock: apiProduct.stock_level > 0,
            category: apiProduct.category || "General"
          };
          
          setProduct(mappedProduct);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load product";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!productId || buyerIds.length === 0) return;

    const loadInventories = async () => {
      try {
        setInventoriesLoading(true);
        const response = await fetchInventoriesForProduct(productId, buyerIds);
        if (response.success) {
          setInventories(response.data);
        }
      } catch (err) {
        console.error("Failed to load inventories:", err);
      } finally {
        setInventoriesLoading(false);
      }
    };

    loadInventories();
  }, [productId, buyerIds.join(",")]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
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
          <p className="text-destructive text-center">{error || "Product not found"}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Prefer an in-stock outlet inventory when available (it drives the actual sell price in cart).
  // Fallback to the catalog product price if no outlet inventory is available.
  const preferredInventory =
    inventories.find((inv) => inv.stock_level > 0 && inv.retail_price > 0) ??
    inventories.find((inv) => inv.retail_price > 0) ??
    null;

  const effectiveUnitPrice =
    preferredInventory?.retail_price && preferredInventory.retail_price > 0
      ? preferredInventory.retail_price
      : product.price;

  const hasStock =
    inventories.some((inv) => inv.stock_level > 0) || Boolean(product.inStock);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // Prefer an in-stock inventory (if present) to ensure we use the correct outlet and price.
    const firstInventory =
      inventories.find((inv) => inv.stock_level > 0) ??
      inventories[0] ??
      null;

    const unitPrice =
      firstInventory?.retail_price && firstInventory.retail_price > 0
        ? firstInventory.retail_price
        : effectiveUnitPrice;
    
    addItem(
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        unitLabel: product.unit,
        unitPrice,
        // Include buyer info if available from inventory
        buyerId: firstInventory?.buyer_id,
        buyerInventoryId: firstInventory?.inventory_id,
      },
      quantity
    );
    
    if (firstInventory) {
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} from ${firstInventory.buyer_name} added to your cart`,
      });
    } else {
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} added to your cart`,
        variant: "default",
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header with back button */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <main className="px-4 py-4 space-y-6">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <Badge 
              className={`absolute top-4 left-4 ${
                product.badge === "sale" 
                  ? "bg-destructive text-destructive-foreground" 
                  : product.badge === "new"
                  ? "bg-primary text-primary-foreground"
                  : "bg-jimat-pastelsage text-jimat-darkgreen"
              }`}
            >
              {product.badge === "sale" && `-${discount}%`}
              {product.badge === "new" && "New"}
              {product.badge === "fast" && "Fast Moving"}
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <h1 className="text-xl font-bold text-foreground mt-1">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{product.unit}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatMYR(effectiveUnitPrice)}
            </span>
            {product.originalPrice && product.originalPrice > effectiveUnitPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatMYR(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                Save {discount}%
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-xl">
            <Truck className="w-5 h-5 text-primary" />
            <span className="text-xs text-center text-muted-foreground">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs text-center text-muted-foreground">Quality Guaranteed</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 bg-muted rounded-xl">
            <RotateCcw className="w-5 h-5 text-primary" />
            <span className="text-xs text-center text-muted-foreground">Easy Returns</span>
          </div>
        </div>

        {/* Available Outlets */}
        <div className="space-y-3" style={{ paddingBottom: "100px" }}>
          <h3 className="font-semibold text-foreground">Available at Outlets</h3>
          {inventoriesLoading ? (
            <div className="text-sm text-muted-foreground">Loading outlets...</div>
          ) : inventories.length === 0 ? (
            <div className="text-sm text-muted-foreground">No outlets found</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {inventories.map((inv) => (
                <div
                  key={inv.inventory_id}
                  onClick={() => navigate(`/inventory/${inv.inventory_id}`)}
                  className="jimat-card p-3 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{inv.buyer_name}</div>
                      {inv.buyer_address && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {inv.buyer_address}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs ${inv.stock_level > 0 ? "text-green-600" : "text-red-600"}`}>
                          {inv.stock_level > 0 ? `Stock: ${inv.stock_level}` : "Out of Stock"}
                        </span>
                        {inv.total_quantity_sold > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Sold: {inv.total_quantity_sold}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-primary">
                        {formatMYR(inv.retail_price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full h-12 text-base gap-2" 
          onClick={handleAddToCart}
          disabled={!hasStock}
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart · {formatMYR(effectiveUnitPrice * quantity)}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
