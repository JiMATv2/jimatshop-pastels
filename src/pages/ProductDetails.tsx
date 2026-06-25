import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart/CartProvider";
import { CartIconButton } from "@/components/cart/CartIconButton";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { toast } from "@/hooks/use-toast";
import { fetchMobileProductById } from "@/lib/api/mobileProducts";
import { fetchInventoriesForProduct, type MobileInventory } from "@/lib/api/mobileInventories";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";
import { MockProductLocationModal } from "@/components/location/MockProductLocationModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Loader2,
  MessageSquare,
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

const formatKm = (km: number | null | undefined) => {
  if (typeof km !== "number" || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shopperId, setShopperId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [inventories, setInventories] = useState<MobileInventory[]>([]);
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { buyerIds, outlets, isLoading: nearbyLoading, hasLocation } = useNearbyBuyerIds();
  const [outletSort, setOutletSort] = useState<"price" | "distance">("price");
  const [isChooseOutletOpen, setIsChooseOutletOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);

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
        const response = await fetchMobileProductById(productId, {
          source: "buyer_inventory",
          buyer_ids: buyerIds.length > 0 ? buyerIds : undefined,
        });
        
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
  }, [productId, buyerIds.join(",")]);

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

  // Prompt for location if the user lands here without one. Seed/mock product
  // details should still load behind the modal so the page isn't blank.
  useEffect(() => {
    if (!nearbyLoading && !hasLocation && !locationChecked) {
      setLocationModalOpen(true);
      setLocationChecked(true);
    }
  }, [nearbyLoading, hasLocation, locationChecked]);

  useEffect(() => {
    if (!user) {
      setShopperId(null);
      setIsFavorite(false);
      return;
    }

    let cancelled = false;

    const loadShopper = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("shoppers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (fetchErr) throw fetchErr;

        let row = data as { id: string } | null;

        if (!row) {
          const { error: upsertErr } = await supabase.rpc("upsert_shopper_for_auth_user", {
            first_name:
              (user.user_metadata?.given_name as string | undefined) ||
              (user.user_metadata?.full_name as string | undefined) ||
              (user.user_metadata?.name as string | undefined) ||
              "",
            last_name: (user.user_metadata?.family_name as string | undefined) || null,
            email: user.email || null,
            phone: user.phone || null,
          });
          if (upsertErr) throw upsertErr;

          const { data: after, error: afterErr } = await supabase
            .from("shoppers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          if (afterErr) throw afterErr;
          row = after as { id: string } | null;
        }

        if (!cancelled) {
          setShopperId(row?.id ?? null);
        }
      } catch (err) {
        console.error("[product-details] Failed to load shopper profile", err);
      }
    };

    loadShopper();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!shopperId || !product?.id) {
      setIsFavorite(false);
      return;
    }

    let cancelled = false;

    const loadFavorite = async () => {
      setFavoriteLoading(true);
      try {
        const { data, error: favErr } = await supabase
          .from("shopper_wishlists")
          .select("id")
          .eq("shopper_id", shopperId)
          .eq("product_id", product.id)
          .maybeSingle();
        if (favErr) throw favErr;

        if (!cancelled) {
          setIsFavorite(Boolean(data));
        }
      } catch (err) {
        console.error("[product-details] Failed to load wishlist state", err);
      } finally {
        if (!cancelled) setFavoriteLoading(false);
      }
    };

    loadFavorite();
    return () => {
      cancelled = true;
    };
  }, [shopperId, product?.id]);


  const basePrice = product?.price ?? 0;

  // Prefer an in-stock outlet inventory when available (it drives the actual sell price in cart).
  // Fallback to the catalog product price if no outlet inventory is available.
  const getInventoryUnitPrice = (inv: MobileInventory | null) => {
    if (!inv) return basePrice;
    if (inv.promotion_price != null && inv.promotion_price > 0) return inv.promotion_price;
    if (inv.retail_price > 0) return inv.retail_price;
    return basePrice;
  };

  const preferredInventory =
    inventories.find((inv) => inv.stock_level > 0 && (inv.promotion_price ?? inv.retail_price) > 0) ??
    inventories.find((inv) => (inv.promotion_price ?? inv.retail_price) > 0) ??
    null;

  const effectiveUnitPrice = getInventoryUnitPrice(preferredInventory);

  const outletDistanceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const outlet of outlets) {
      const id = typeof outlet.id === "string" ? outlet.id : String(outlet.id);
      const distance = typeof outlet.distance_in_km === "number" ? outlet.distance_in_km : Number(outlet.distance_in_km);
      if (!id || !Number.isFinite(distance)) continue;
      map.set(id, distance);
    }
    return map;
  }, [outlets]);

  const sortedInventories = useMemo(() => {
    const list = [...inventories];
    if (outletSort === "distance") {
      list.sort((a, b) => {
        const aDistance = outletDistanceMap.get(a.buyer_id) ?? Number.POSITIVE_INFINITY;
        const bDistance = outletDistanceMap.get(b.buyer_id) ?? Number.POSITIVE_INFINITY;
        if (aDistance !== bDistance) return aDistance - bDistance;
        return getInventoryUnitPrice(a) - getInventoryUnitPrice(b);
      });
      return list;
    }

    list.sort((a, b) => {
      const aPrice = getInventoryUnitPrice(a);
      const bPrice = getInventoryUnitPrice(b);
      if (aPrice !== bPrice) return aPrice - bPrice;
      const aDistance = outletDistanceMap.get(a.buyer_id) ?? Number.POSITIVE_INFINITY;
      const bDistance = outletDistanceMap.get(b.buyer_id) ?? Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    });
    return list;
  }, [inventories, outletSort, outletDistanceMap]);

  const hasStock =
    inventories.some((inv) => inv.stock_level > 0) || Boolean(product?.inStock);

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - basePrice) / product.originalPrice) * 100)
    : 0;

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
        <StickyHeader>
          <div className="flex items-center justify-between px-4 py-3 safe-area-x">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </StickyHeader>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4">
          <p className="text-destructive text-center">{error || "Product not found"}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsChooseOutletOpen(true);
  };

  const handleSelectOutletAndAdd = (inv: MobileInventory) => {
    const unitPrice = getInventoryUnitPrice(inv);
    addItem(
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        unitLabel: product.unit,
        unitPrice,
        buyerId: inv.buyer_id,
        buyerInventoryId: inv.inventory_id,
      },
      quantity
    );
    setIsChooseOutletOpen(false);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const resolveShopperId = async () => {
    if (!user) return null;
    if (shopperId) return shopperId;

    const { data, error: fetchErr } = await supabase
      .from("shoppers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    let row = data as { id: string } | null;

    if (!row) {
      const { error: upsertErr } = await supabase.rpc("upsert_shopper_for_auth_user", {
        first_name:
          (user.user_metadata?.given_name as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          "",
        last_name: (user.user_metadata?.family_name as string | undefined) || null,
        email: user.email || null,
        phone: user.phone || null,
      });
      if (upsertErr) throw upsertErr;

      const { data: after, error: afterErr } = await supabase
        .from("shoppers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (afterErr) throw afterErr;
      row = after as { id: string } | null;
    }

    const resolvedId = row?.id ?? null;
    if (resolvedId) setShopperId(resolvedId);
    return resolvedId;
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products to your wishlist.",
        variant: "destructive",
      });
      return;
    }
    if (!product || favoriteSaving) return;

    setFavoriteSaving(true);
    try {
      const resolvedShopperId = await resolveShopperId();
      if (!resolvedShopperId) {
        throw new Error("Missing shopper profile");
      }

      if (isFavorite) {
        const { error: deleteErr } = await supabase
          .from("shopper_wishlists")
          .delete()
          .eq("shopper_id", resolvedShopperId)
          .eq("product_id", product.id);
        if (deleteErr) throw deleteErr;

        setIsFavorite(false);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} removed from your wishlist.`,
        });
      } else {
        const { error: insertErr } = await supabase
          .from("shopper_wishlists")
          .insert(
            { shopper_id: resolvedShopperId, product_id: product.id },
            { onConflict: "shopper_id,product_id", ignoreDuplicates: true },
          );
        if (insertErr) throw insertErr;

        setIsFavorite(true);
        toast({
          title: "Added to wishlist",
          description: `${product.name} saved to your wishlist.`,
        });
      }
    } catch (err) {
      console.error("[product-details] Failed to update wishlist", err);
      toast({
        title: "Wishlist update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setFavoriteSaving(false);
    }
  };

  const productHeader = (
    <StickyHeader>
      <div className="flex items-center justify-between px-4 py-3 safe-area-x">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            disabled={favoriteSaving || favoriteLoading}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <CartIconButton />
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </StickyHeader>
  );

  const productImage = (
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
  );

  const productInfo = (
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
  );

  const productDescription = (
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground">Description</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {product.description}
      </p>
    </div>
  );

  const askShopButton = user && sortedInventories[0]?.buyer_id ? (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => {
        const buyerId = sortedInventories[0].buyer_id;
        const params = new URLSearchParams({
          buyer_id: buyerId,
          inquiry_product_id: product.id,
          inquiry_image_url: product.image,
        });
        navigate(`/chat?${params.toString()}`);
      }}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Ask the shop about this product
    </Button>
  ) : null;

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
  );

  const addToCartButtonInline = (
    <Button 
      className="w-full h-12 text-base gap-2" 
      onClick={handleAddToCart}
      disabled={!hasStock}
      data-testid="add-to-cart-button"
    >
      <ShoppingCart className="w-5 h-5" />
      Add to Cart · {formatMYR(effectiveUnitPrice * quantity)}
    </Button>
  );

  const outletsSection = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground">Available at Outlets</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOutletSort((prev) => (prev === "price" ? "distance" : "price"))}
          className="text-xs"
        >
          Sort by {outletSort === "price" ? "Distance" : "Price"}
        </Button>
      </div>
      {inventoriesLoading ? (
        <div className="text-sm text-muted-foreground">Loading outlets...</div>
      ) : inventories.length === 0 ? (
        <div className="text-sm text-muted-foreground">No outlets found</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sortedInventories.map((inv) => {
            const distanceLabel = formatKm(outletDistanceMap.get(inv.buyer_id));
            return (
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
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`text-xs ${inv.stock_level > 0 ? "text-green-600" : "text-red-600"}`}>
                        {inv.stock_level > 0 ? `Stock: ${inv.stock_level}` : "Out of Stock"}
                      </span>
                      {inv.total_quantity_sold > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Sold: {inv.total_quantity_sold}
                        </span>
                      )}
                      {distanceLabel && (
                        <span className="text-xs text-muted-foreground">{distanceLabel}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-primary">
                      {formatMYR(getInventoryUnitPrice(inv))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <ResponsivePage
        mobile={
          <div className="min-h-screen bg-background pb-bottom-nav">
            {productHeader}
            <main className="px-4 py-4 space-y-6 safe-area-x mx-8">
              {productImage}
              {productInfo}
              {productDescription}
              {askShopButton}
              <div style={{ paddingBottom: "160px" }}>
                {outletsSection}
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
              <div className="px-8">
                <Button 
                  className="w-full h-12 text-base gap-2" 
                  onClick={handleAddToCart}
                  disabled={!hasStock}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart · {formatMYR(effectiveUnitPrice * quantity)}
                </Button>
              </div>
            </div>
            <BottomNav />
          </div>
        }
        tablet={
          <div className="min-h-screen bg-background pb-28">
            {productHeader}
            <TabletContainer>
              <main className="py-6">
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* Left Column - Product Media & Actions */}
                  <div className="col-span-5 space-y-6">
                    {productImage}
                    {askShopButton}
                  </div>

                  {/* Right Column - Product details & buying options */}
                  <div className="col-span-7 space-y-6">
                    {productInfo}
                    {productDescription}
                    <div className="p-4 border rounded-2xl bg-card/50 space-y-4">
                      {quantitySelector}
                      {addToCartButtonInline}
                    </div>
                    {outletsSection}
                  </div>
                </div>
              </main>
            </TabletContainer>
            <BottomNav />
          </div>
        }
      />

      <Dialog open={isChooseOutletOpen} onOpenChange={setIsChooseOutletOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Outlet</DialogTitle>
            <DialogDescription>
              Select which outlet/seller to buy this item from:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {sortedInventories.map((inv) => {
              const distanceLabel = formatKm(outletDistanceMap.get(inv.buyer_id));
              const unitPrice = getInventoryUnitPrice(inv);
              const isOutOfStock = inv.stock_level <= 0;
              return (
                <div
                  key={inv.inventory_id}
                  className={cn(
                    "flex flex-col p-3 rounded-xl border transition-colors",
                    isOutOfStock ? "opacity-60 bg-muted/20" : "bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{inv.buyer_name}</div>
                      {inv.buyer_address && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5 max-w-[250px]">
                          {inv.buyer_address}
                        </div>
                      )}
                      <div className="flex gap-2 items-center mt-1.5">
                        <span className={`text-xs ${!isOutOfStock ? "text-green-600 font-medium" : "text-red-600"}`}>
                          {!isOutOfStock ? `Stock: ${inv.stock_level}` : "Out of stock"}
                        </span>
                        {distanceLabel && (
                          <span className="text-[11px] text-muted-foreground">· {distanceLabel}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-sm">{formatMYR(unitPrice)}</div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 h-8 text-xs font-semibold"
                    disabled={isOutOfStock}
                    onClick={() => handleSelectOutletAndAdd(inv)}
                    data-testid={`select-outlet-btn-${inv.buyer_id}`}
                  >
                    Select & Add
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <MockProductLocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
      />
    </>
  );
}
