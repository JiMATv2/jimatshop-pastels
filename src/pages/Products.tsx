import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMobileProducts, getMobileProductsClientConfig, type MobileProduct } from "@/lib/api/mobileProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";
import { useAuth } from "@/lib/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { notificationService } from "@/lib/notifications/notificationService";
import { supabase } from "@/lib/supabase/client";

type SectionKey = "featured" | "popular";

function parseSection(v: string | null): SectionKey {
  return v === "popular" ? "popular" : "featured";
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const section = useMemo(
    () => parseSection(searchParams.get("section")),
    [searchParams],
  );
  const buyerIdParam = searchParams.get("buyer_id"); // Single buyer ID from URL
  const searchQuery = (searchParams.get("q") || "").trim();
  const { buyerIds: nearbyBuyerIds, outlets, isLoading: buyerIdsLoading, hasLocation } = useNearbyBuyerIds();
  
  // Use buyer_id from URL if provided, otherwise use nearby buyer IDs
  const buyerIds = buyerIdParam ? [buyerIdParam] : nearbyBuyerIds;
  const [page, setPage] = useState(1);

  // Find the specific buyer outlet info if buyer_id is provided
  const selectedBuyerOutlet = buyerIdParam 
    ? outlets.find((o) => String(o.id) === buyerIdParam)
    : null;

  const { data: selectedBuyerShop } = useQuery({
    queryKey: ["buyer-shop-details", buyerIdParam ?? null],
    queryFn: async () => {
      if (!buyerIdParam) return null;
      const { data, error } = await supabase
        .from("buyers")
        .select("id,business_name,address,shop_photo_url,signboard_photo_url,lat,lng")
        .eq("id", buyerIdParam)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as {
        id: string;
        business_name: string | null;
        address: string | null;
        shop_photo_url: string | null;
        signboard_photo_url: string | null;
        lat: number | null;
        lng: number | null;
      } | null;
    },
    enabled: Boolean(buyerIdParam),
    staleTime: 60_000,
  });

  const { data: shopperId } = useQuery({
    queryKey: ["shopper-id", user?.id ?? null],
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
    data: isFollowing,
    isLoading: isFollowLoading,
    refetch: refetchFollow,
  } = useQuery({
    queryKey: ["buyer-follow-status", buyerIdParam ?? null, shopperId ?? null],
    queryFn: async () => {
      if (!buyerIdParam || !shopperId) return false;
      const { data, error } = await supabase
        .from("buyer_followers")
        .select("id")
        .eq("buyer_id", buyerIdParam)
        .eq("shopper_id", shopperId)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data?.id);
    },
    enabled: Boolean(buyerIdParam && shopperId),
    staleTime: 30_000,
  });

  const [isFollowSaving, setIsFollowSaving] = useState(false);

  const handleFollow = async () => {
    if (!buyerIdParam) return;
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow this shop.",
      });
      return;
    }
    if (!shopperId) {
      toast({
        title: "Shopper profile missing",
        description: "Please sign out and sign in again to follow this shop.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsFollowSaving(true);
      const { error } = await supabase
        .from("buyer_followers")
        .upsert(
          {
            buyer_id: buyerIdParam,
            shopper_id: shopperId,
          },
          {
            onConflict: "buyer_id,shopper_id",
          },
        );
      if (error) throw error;
      await refetchFollow();
      await notificationService.requestPermissionAndGetToken(user.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to follow shop.";
      console.error("[Products] Follow failed:", err);
      toast({
        title: "Follow failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsFollowSaving(false);
    }
  };

  // For "nearby inventories" view, show the nearest shop details at the top.
  const nearestOutlet = !buyerIdParam ? (outlets[0] ?? null) : null;

  const title = buyerIdParam
    ? selectedBuyerShop?.business_name
      ? `${selectedBuyerShop.business_name} Products`
      : selectedBuyerOutlet?.name 
      ? `${selectedBuyerOutlet.name} Products`
      : "Shop Products"
    : section === "featured"
    ? "🔥 Hot Deals (Nearby Inventories)"
    : "⭐ Popular (Nearby Inventories)";
  const cfg = getMobileProductsClientConfig();

  useEffect(() => {
    setPage(1);
  }, [section, buyerIds.join(","), searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mobile-products-buyer-catalog", section, buyerIds, page, searchQuery],
    queryFn: async () => {
      if (!cfg.apiToken) return { items: [] as MobileProduct[], pagination: undefined };
      // If buyer_id is provided, don't require location
      if (!buyerIdParam && (!hasLocation || buyerIds.length === 0))
        return { items: [] as MobileProduct[], pagination: undefined };

      // Debug: Log buyer IDs being sent
      console.debug("[Products] Fetching buyer inventory for buyer_ids:", buyerIds);
      console.debug("[Products] Number of buyer IDs:", buyerIds.length);
      console.debug("[Products] Nearby outlets count:", outlets.length);
      console.debug("[Products] Buyer IDs array:", JSON.stringify(buyerIds));
      
      // Validation: Ensure we have multiple buyer IDs when not filtering by single buyer
      if (!buyerIdParam && buyerIds.length === 1) {
        console.warn("[Products] WARNING: Only 1 buyer ID found, expected multiple nearby buyers");
      }

      const resp = await fetchMobileProducts(
          {
            page,
            limit_count: 12,
            search_query: searchQuery,
          source: "buyer_inventory",
          buyer_ids: buyerIds,
          },
          cfg,
        );

      // Debug: Log products in response
      console.debug("[Products] Products in response:", resp.data.length);

      // Sorting is handled by backend (best-sellers from jimatshop_orders).
      return { items: resp.data, pagination: resp.pagination };
    },
    enabled: buyerIdParam ? true : !buyerIdsLoading, // Enable immediately if buyer_id is provided
    staleTime: 60_000,
  });

  const items: MobileProduct[] = (data?.items ?? []) as MobileProduct[];
  const pagination = Array.isArray(data) ? undefined : data?.pagination;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4">


        {/* Shop details on top */}
        {buyerIdParam ? (
          <section className="jimat-card p-3 mb-4">
            <div className="flex items-start gap-3">
              <img
                src={selectedBuyerShop?.shop_photo_url || selectedBuyerShop?.signboard_photo_url || "/placeholder.svg"}
                alt={selectedBuyerShop?.business_name || selectedBuyerOutlet?.name || "Shop"}
                className="h-12 w-12 rounded-xl object-cover bg-muted flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {selectedBuyerShop?.business_name || selectedBuyerOutlet?.name || "Shop"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {selectedBuyerShop?.address || selectedBuyerOutlet?.address || "—"}
                    </div>
                    {typeof selectedBuyerOutlet?.distance_in_km === "number" ? (
                      <div className="text-xs font-medium text-primary mt-1">
                        {selectedBuyerOutlet.distance_in_km.toFixed(1)} km away
                      </div>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowing ? "secondary" : "default"}
                    className="shrink-0"
                    onClick={handleFollow}
                    disabled={Boolean(isFollowing) || isFollowSaving || isFollowLoading}
                  >
                    {isFollowing ? "Following" : isFollowSaving ? "Following…" : "Follow"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="jimat-card p-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-foreground">Nearest shop</div>
              {nearestOutlet && typeof nearestOutlet.distance_in_km === "number" ? (
                <div className="text-xs font-medium text-primary whitespace-nowrap">
                  {nearestOutlet.distance_in_km.toFixed(1)} km
                </div>
              ) : null}
            </div>
            {buyerIdsLoading ? (
              <div className="text-xs text-muted-foreground mt-1">Finding nearby buyers…</div>
            ) : !hasLocation ? (
              <div className="text-xs text-muted-foreground mt-1">Location not set.</div>
            ) : nearestOutlet ? (
              <>
                <div className="text-sm font-medium text-foreground mt-2 truncate">
                  {nearestOutlet.name || "Buyer"}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {nearestOutlet.address || "—"}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">No buyers found within 20km.</div>
            )}
          </section>
        )}

        <div className="grid grid-cols-3 gap-3">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="jimat-card">
                <div className="p-3 space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            items.map((product, idx) => {
              // Prefer promotion price when available; use catalog price as fallback.
              const displayPrice =
                product.promotion_price != null ? product.promotion_price : product.normal_price;
              const originalPrice =
                product.promotion_price != null ? product.normal_price : undefined;
              const outletsWithStock =
                typeof product.outlets_with_stock === "number"
                  ? product.outlets_with_stock
                  : product.stock_level > 0
                  ? 1
                  : 0;
              const totalOutlets =
                typeof product.total_outlets === "number" ? product.total_outlets : outletsWithStock;
              const totalQuantitySold =
                typeof product.total_quantity_sold === "number"
                  ? product.total_quantity_sold
                  : product.products_sold;
              return (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  productName={product.name}
                  price={displayPrice}
                  originalPrice={originalPrice}
                  coverImageUrl={product.cover_image_url}
                  outletsWithStock={outletsWithStock}
                  totalOutlets={totalOutlets}
                  totalQuantitySold={totalQuantitySold}
                  delay={idx * 25}
                />
              );
            })
          )}
        </div>

        {pagination && pagination.total_pages > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPage((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={isLoading || !pagination.has_previous_page}
            >
              Prev
            </Button>
            <div className="text-xs text-muted-foreground">
              Page {pagination.current_page} of {pagination.total_pages} · {pagination.total_count} items
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => 
                {
                  setPage((prev) => prev + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
              disabled={isLoading || !pagination.has_next_page}
            >
              Next
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Failed to load inventories.
          </p>
        ) : null}

        {!cfg.apiToken ? (
          <p className="mt-2 text-xs text-muted-foreground">
            API token not configured (VITE_SUPABASE_API_TOKEN).
          </p>
        ) : null}

        {/* Move nearby outlets list to bottom */}
        {!buyerIdParam ? (
          <section className="jimat-card p-3 mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-foreground">
                Nearby buyer outlets (20km)
              </div>
              {!buyerIdsLoading && buyerIds.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {buyerIds.length} {buyerIds.length === 1 ? "outlet" : "outlets"}
                </div>
              )}
            </div>
            {!hasLocation ? (
              <div className="text-xs text-muted-foreground mt-1">Location not set.</div>
            ) : buyerIdsLoading ? (
              <div className="text-xs text-muted-foreground mt-1">Finding nearby buyers…</div>
            ) : outlets.length === 0 ? (
              <div className="text-xs text-muted-foreground mt-1">
                No buyers found within 20km.
              </div>
            ) : (
              <>
                <div className="mt-2 space-y-2">
                  {outlets.slice(0, 6).map((o) => (
                    <div key={String(o.id)} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {o.name || "Buyer"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {o.address || "—"}
                        </div>
                        {typeof o.lat === "number" && typeof o.lng === "number" ? (
                          <div className="text-[11px] text-muted-foreground">
                            {o.lat.toFixed(6)}, {o.lng.toFixed(6)}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-xs font-medium text-primary whitespace-nowrap">
                        {typeof o.distance_in_km === "number" ? `${o.distance_in_km.toFixed(1)} km` : ""}
                      </div>
                    </div>
                  ))}
                </div>
                {items.length > 0 ? (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Showing {items.length} product{items.length !== 1 ? "s" : ""} from {buyerIds.length}{" "}
                      {buyerIds.length === 1 ? "outlet" : "outlets"}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}


