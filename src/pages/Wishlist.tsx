import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const isLoading = shopperLoading || wishlistLoading;
  const hasItems = wishlistItems.some((row) => row.product?.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Wishlist</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : hasItems ? (
          <div className="grid grid-cols-2 gap-3">
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
        ) : (
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
        )}
      </main>
      <BottomNav />
    </div>
  );
}

