import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Heart, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";

type WishlistRow = {
  id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    normal_price: number;
    promotion_price: number | null;
    cover_image_url: string | null;
    category: string | null;
    sub_category: string | null;
  } | null;
};

type FollowedRetailerRow = {
  id: string;
  created_at: string;
  buyer: {
    id: string;
    business_name: string;
    outlet_name: string | null;
    address: string | null;
    shop_photo_url: string | null;
    state: string | null;
    city: string | null;
  } | null;
};

const formatMYR = (amount: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(amount);

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "retailers">("products");

  const { data: shopperId, isLoading: shopperLoading } = useQuery({
    queryKey: ["shopper-id", user?.id ?? null, "wishlist"],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc("upsert_shopper_for_auth_user", {
        first_name:
          (user.user_metadata?.given_name as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          "",
        last_name: (user.user_metadata?.family_name as string | undefined) || null,
        email: user.email || null,
        phone: user.phone || null,
      });
      if (error) throw error;
      return (data as string | null) ?? null;
    },
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const {
    data: wishlistItems = [],
    isLoading: wishlistLoading,
  } = useQuery({
    queryKey: ["wishlist-items", shopperId ?? null],
    queryFn: async () => {
      if (!shopperId) return [];
      const { data, error } = await supabase
        .from("shopper_wishlists")
        .select(
          "id, created_at, product:product_id (id, name, normal_price, promotion_price, cover_image_url, category, sub_category)",
        )
        .eq("shopper_id", shopperId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WishlistRow[];
    },
    enabled: Boolean(shopperId),
    staleTime: 30_000,
  });

  const {
    data: followedRetailers = [],
    isLoading: followedLoading,
  } = useQuery({
    queryKey: ["followed-retailers", shopperId ?? null],
    queryFn: async () => {
      if (!shopperId) return [];
      const { data, error } = await supabase
        .from("buyer_followers")
        .select(
          "id, created_at, buyer:buyer_id (id, business_name, outlet_name, address, shop_photo_url, state, city)",
        )
        .eq("shopper_id", shopperId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FollowedRetailerRow[];
    },
    enabled: Boolean(shopperId),
    staleTime: 30_000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")}>Go to Home</Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const isLoading = shopperLoading || wishlistLoading || followedLoading;
  const hasItems = wishlistItems.some((row) => row.product?.id);
  const hasRetailers = followedRetailers.some((row) => row.buyer?.id);

  const wishlistTitle = (
    <div className="flex items-center gap-2">
      <Heart className="h-5 w-5 text-primary" />
      <h1 className="text-xl md:text-2xl font-semibold text-foreground">Wishlist</h1>
    </div>
  );

  const getProductsContent = (colsClass: string) => {
    if (isLoading) {
      return (
        <div className={`grid ${colsClass} gap-3`}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (!hasItems) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">No saved items yet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Save items you love and they will appear here.
            </p>
            <Button className="mt-4" onClick={() => navigate("/products")}>
              Browse products
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className={`grid ${colsClass} gap-3`}>
        {wishlistItems.map((item) => {
          const product = item.product;
          if (!product) return null;
          const promoPrice = product.promotion_price != null ? asNumber(product.promotion_price) : null;
          const normalPrice = asNumber(product.normal_price);
          const displayPrice = promoPrice && promoPrice > 0 ? promoPrice : normalPrice;
          const showOriginal = promoPrice != null && promoPrice > 0 && normalPrice > promoPrice;

          return (
            <div
              key={item.id}
              className="jimat-card cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="p-3">
                <div className="aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.cover_image_url || "https://via.placeholder.com/400"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {product.sub_category || product.category || "1 unit"}
                  </p>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-base font-bold text-primary">{formatMYR(displayPrice)}</span>
                    {showOriginal ? (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatMYR(normalPrice)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getRetailersContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (!hasRetailers) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">No followed retailers yet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Follow retailers you shop at and they will appear here.
            </p>
            <Button className="mt-4" onClick={() => navigate("/shops")}>
              Browse outlets
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {followedRetailers.map((item) => {
          const buyer = item.buyer;
          if (!buyer) return null;
          const name = buyer.business_name || buyer.outlet_name || "Retailer";
          const address = [buyer.address, buyer.city, buyer.state].filter(Boolean).join(", ") || "—";
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/products?buyer_id=${buyer.id}`)}
              className="w-full text-left jimat-card p-0 overflow-hidden transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <div className="p-4 grid grid-cols-4 items-center">
                <div className="col-span-1 flex justify-center">
                  <div className="h-14 w-14 rounded-xl bg-jimat-green/15 flex items-center justify-center text-jimat-darkgreen overflow-hidden">
                    <img
                      src={buyer.shop_photo_url || "https://jimatshop.com/images/icons/store.svg"}
                      alt="Store"
                      className="h-10 w-10 object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="col-span-3 ml-3 min-w-0">
                  <h5 className="text-sm font-semibold text-foreground leading-5 truncate">
                    {name}
                  </h5>
                  <p className="py-1 text-xs text-muted-foreground leading-tight truncate">
                    {address}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background pb-24">
          <Header />
          <main className="px-4 py-6 space-y-4">
            {wishlistTitle}
            
            {/* Tab Controls */}
            <div className="flex border-b border-border">
              <button
                className={cn(
                  "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-colors",
                  activeTab === "products"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActiveTab("products")}
              >
                Products ({wishlistItems.length})
              </button>
              <button
                className={cn(
                  "flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-colors",
                  activeTab === "retailers"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActiveTab("retailers")}
              >
                Retailers ({followedRetailers.length})
              </button>
            </div>

            {activeTab === "products" ? getProductsContent("grid-cols-2") : getRetailersContent()}
          </main>
          <BottomNav />
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background pb-28">
          <Header />
          <TabletContainer>
            <main className="py-6 space-y-6">
              {wishlistTitle}
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Products Column */}
                <div className="col-span-7 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Saved Products ({wishlistItems.length})</h3>
                  {getProductsContent("grid-cols-3")}
                </div>

                {/* Retailers Column */}
                <div className="col-span-5 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Followed Retailers ({followedRetailers.length})</h3>
                  {getRetailersContent()}
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
