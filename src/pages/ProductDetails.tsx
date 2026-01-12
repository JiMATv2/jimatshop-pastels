import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart/CartProvider";
import { toast } from "@/hooks/use-toast";
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
  RotateCcw
} from "lucide-react";

// Mock product data - in production this would come from your database
const MOCK_PRODUCTS: Record<string, {
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
}> = {
  "1": {
    id: "1",
    name: "Fresh Red Apples",
    price: 5.99,
    originalPrice: 7.99,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    badge: "sale",
    description: "Crisp and sweet red apples, perfect for snacking or baking. Sourced from local Malaysian orchards, these apples are hand-picked at peak ripeness to ensure the best flavor and freshness.",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    category: "Fruits"
  },
  "2": {
    id: "2",
    name: "Organic Bananas",
    price: 4.50,
    unit: "1 bunch",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    badge: "new",
    description: "Naturally ripened organic bananas, rich in potassium and perfect for smoothies, baking, or eating fresh. No artificial ripening agents used.",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    category: "Fruits"
  },
  "3": {
    id: "3",
    name: "Fresh Milk 1L",
    price: 6.90,
    unit: "1 litre",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    badge: "fast",
    description: "Farm-fresh pasteurized milk from grass-fed cows. High in calcium and protein, perfect for the whole family.",
    rating: 4.9,
    reviews: 256,
    inStock: true,
    category: "Dairy"
  },
};

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Get product data - fallback to default mock if not found
  const DEFAULT_PRODUCT = {
    id: productId || "default",
    name: "Premium Mixed Nuts",
    price: 18.90,
    originalPrice: 24.90,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
    badge: "sale" as const,
    description: "A delicious assortment of premium roasted nuts including almonds, cashews, walnuts, and hazelnuts. Perfect for snacking, baking, or adding to your favorite recipes. High in protein and healthy fats.",
    rating: 4.7,
    reviews: 203,
    inStock: true,
    category: "Snacks"
  };

  const product = productId && MOCK_PRODUCTS[productId] 
    ? MOCK_PRODUCTS[productId] 
    : DEFAULT_PRODUCT;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        unitLabel: product.unit,
        unitPrice: product.price,
      },
      quantity
    );
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart`,
    });
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
              {formatMYR(product.price)}
            </span>
            {product.originalPrice && (
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

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
          <span className={`text-sm ${product.inStock ? "text-green-600" : "text-red-600"}`}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
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
          disabled={!product.inStock}
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart · {formatMYR(product.price * quantity)}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
