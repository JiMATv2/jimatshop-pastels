import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchMobileProducts,
  fetchMobilePromos,
  getMobileProductsClientConfig,
  type MobileProduct,
} from "@/lib/api/mobileProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";
import { useAuth } from "@/lib/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { notificationService } from "@/lib/notifications/notificationService";
import { supabase } from "@/lib/supabase/client";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, ChevronRight, Layers, LayoutGrid, PackageSearch, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionKey = "featured" | "popular";

function parseSection(v: string | null): SectionKey {
  return v === "popular" ? "popular" : "featured";
}

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const section = useMemo(
    () => parseSection(searchParams.get("section")),
    [searchParams],
  );
  const buyerIdParam = searchParams.get("buyer_id"); // Single buyer ID from URL
  const searchQuery = (searchParams.get("q") || "").trim();
  const categoryFilter = (searchParams.get("category") || "").trim();
  const { buyerIds: nearbyBuyerIds, outlets, isLoading: buyerIdsLoading, hasLocation } = useNearbyBuyerIds();
  
  // Use buyer_id from URL if provided, otherwise use nearby buyer IDs
  const buyerIds = buyerIdParam ? [buyerIdParam] : nearbyBuyerIds;
  const [page, setPage] = useState(1);

  // Detect tablet viewport
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const limitCount = isTablet ? 20 : 12;

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
  }, [section, buyerIds.join(","), searchQuery, categoryFilter]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mobile-products-buyer-catalog", section, buyerIds, page, searchQuery, categoryFilter, limitCount],
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
          limit_count: limitCount,
          search_query: searchQuery,
          category_filter: categoryFilter || undefined,
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

  const productIds = useMemo(
    () => items.map((product) => String(product.id)).filter(Boolean),
    [items],
  );

  const { data: promoResp } = useQuery({
    queryKey: ["product-promos", buyerIds.join(","), productIds.join(",")],
    queryFn: async () => {
      if (buyerIds.length === 0 || productIds.length === 0) {
        return {
          campaign_product_ids: [],
          buyer_promo_product_ids: [],
          campaign_promos: [],
          buyer_promos: [],
        };
      }
      const resp = await fetchMobilePromos({ buyer_ids: buyerIds, product_ids: productIds }, cfg);
      return resp.data;
    },
    enabled: buyerIds.length > 0 && productIds.length > 0,
    staleTime: 60_000,
  });

  const campaignPromoProductIds = useMemo(
    () => new Set<string>((promoResp?.campaign_product_ids ?? []).map(String)),
    [promoResp?.campaign_product_ids],
  );

  const buyerPromoProductIds = useMemo(
    () => new Set<string>((promoResp?.buyer_promo_product_ids ?? []).map(String)),
    [promoResp?.buyer_promo_product_ids],
  );


  const campaignPromoPrices = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of promoResp?.campaign_promos ?? []) {
      const price =
        typeof row.promo_price === "number" ? row.promo_price : row.promo_price != null ? Number(row.promo_price) : NaN;
      if (row.product_id && Number.isFinite(price)) map.set(String(row.product_id), price);
    }
    return map;
  }, [promoResp?.campaign_promos]);

  const buyerPromoPrices = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of promoResp?.buyer_promos ?? []) {
      const price =
        typeof row.promo_price === "number" ? row.promo_price : row.promo_price != null ? Number(row.promo_price) : NaN;
      if (row.product_id && Number.isFinite(price)) map.set(String(row.product_id), price);
    }
    return map;
  }, [promoResp?.buyer_promos]);

  const handleShopClick = (buyerId: string) => {
    navigate(`/products?buyer_id=${buyerId}`);
  };

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id,name,image_url,parent_id")
        .is("parent_id", null)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []).filter((category: any) => category?.name) as Array<{
        id: string;
        name: string;
        image_url: string | null;
      }>;
    },
    staleTime: 5 * 60_000,
  });

  const handleCategorySelect = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!categoryName || categoryName.toLowerCase() === categoryFilter.toLowerCase()) {
      params.delete("category");
    } else {
      params.set("category", categoryName);
    }
    setPage(1);
    navigate({
      pathname: "/products",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const mobileCategoryDropdown = (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select
            value={categoryFilter || "ALL"}
            onValueChange={(val) => handleCategorySelect(val === "ALL" ? null : val)}
          >
            <SelectTrigger className="w-full bg-card rounded-xl border-border/80 h-11 px-3 text-xs font-medium shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">Category:</span>
                <span className="truncate font-semibold text-foreground">
                  {categoryFilter || "All Categories"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-80 z-50">
              <SelectItem value="ALL">
                <div className="flex items-center gap-2 text-xs font-medium py-0.5">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <span>All Categories</span>
                </div>
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  <div className="flex items-center gap-2 text-xs py-0.5">
                    {cat.image_url ? (
                      <span className="h-4 w-4 rounded-full bg-white dark:bg-muted p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </span>
                    ) : (
                      <span className="h-4 w-4 rounded-full bg-muted text-[9px] flex items-center justify-center font-bold shrink-0">
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate">{cat.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {categoryFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCategorySelect(null)}
            className="h-11 px-3 text-xs text-muted-foreground hover:text-foreground shrink-0 rounded-xl cursor-pointer"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );

  const desktopCategoryChips = (
    <section className="jimat-card p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</span>
        </div>
        {categoryFilter && (
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto no-scrollbar pr-0.5">
        <button
          type="button"
          onClick={() => handleCategorySelect(null)}
          className={cn(
            "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left",
            !categoryFilter
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : "bg-muted/40 hover:bg-muted text-foreground border border-border/50"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                "h-5 w-5 rounded-md flex items-center justify-center shrink-0",
                !categoryFilter
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-3 w-3" />
            </span>
            <span className="truncate">All Categories</span>
          </div>
          {!categoryFilter && <Check className="h-3.5 w-3.5 shrink-0" />}
        </button>

        {isCategoriesLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2">
                <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))
          : categories.map((cat) => {
              const isSelected = categoryFilter.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left group",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted/40 hover:bg-muted text-foreground border border-border/50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "h-5 w-5 rounded-md flex items-center justify-center p-0.5 shrink-0 bg-white dark:bg-muted shadow-2xs overflow-hidden",
                        isSelected && "ring-1 ring-primary-foreground/30"
                      )}
                    >
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-foreground">
                          {cat.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {isSelected ? (
                    <X className="h-3.5 w-3.5 shrink-0 opacity-80 group-hover:opacity-100" />
                  ) : null}
                </button>
              );
            })}
      </div>
    </section>
  );

  const shopDetailsCard = buyerIdParam ? (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => {
          const params = new URLSearchParams(searchParams);
          params.delete("buyer_id");
          navigate({
            pathname: "/products",
            search: params.toString() ? `?${params.toString()}` : "",
          });
        }}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-2 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all nearby stores</span>
      </button>
      <section className="jimat-card p-3">
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
    </div>
  ) : (
    <section
      className={cn(
        "jimat-card p-3 mb-4 transition-all duration-200",
        nearestOutlet && "cursor-pointer hover:border-primary/50 hover:bg-muted/40 active:bg-muted group"
      )}
      onClick={() => {
        if (nearestOutlet?.id) {
          handleShopClick(String(nearestOutlet.id));
        }
      }}
      role={nearestOutlet ? "button" : undefined}
      tabIndex={nearestOutlet ? 0 : undefined}
      onKeyDown={(e) => {
        if (nearestOutlet?.id && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleShopClick(String(nearestOutlet.id));
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Store className="h-4 w-4 text-primary shrink-0" />
          <span>Nearest shop</span>
        </div>
        <div className="flex items-center gap-1.5">
          {nearestOutlet && typeof nearestOutlet.distance_in_km === "number" ? (
            <div className="text-xs font-medium text-primary whitespace-nowrap">
              {nearestOutlet.distance_in_km.toFixed(1)} km
            </div>
          ) : null}
          {nearestOutlet && (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
      {buyerIdsLoading ? (
        <div className="text-xs text-muted-foreground mt-1">Finding nearby buyers…</div>
      ) : !hasLocation ? (
        <div className="text-xs text-muted-foreground mt-1">Location not set.</div>
      ) : nearestOutlet ? (
        <div className="mt-2">
          <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {nearestOutlet.name || "Buyer"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {nearestOutlet.address || "—"}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
            <span>Visit store</span>
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground mt-1">No buyers found within 20km.</div>
      )}
    </section>
  );

  const nearbyOutletsSection = !buyerIdParam ? (
    <section className="jimat-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Store className="h-4 w-4 text-primary shrink-0" />
          <span>Nearby buyer outlets (20km)</span>
        </div>
        <div className="flex items-center gap-2">
          {!buyerIdsLoading && buyerIds.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {buyerIds.length} {buyerIds.length === 1 ? "outlet" : "outlets"}
            </div>
          )}
          <Link
            to="/shops"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
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
            {outlets.slice(0, 6).map((o) => {
              const outletId = String(o.id);
              return (
                <div
                  key={outletId}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleShopClick(outletId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleShopClick(outletId);
                    }
                  }}
                  className="flex items-start justify-between gap-3 p-2.5 -mx-1 rounded-lg cursor-pointer hover:bg-muted/60 active:bg-muted transition-all group border border-transparent hover:border-border"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="truncate">{o.name || "Buyer"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {o.address || "—"}
                    </div>
                    {typeof o.lat === "number" && typeof o.lng === "number" ? (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {o.lat.toFixed(6)}, {o.lng.toFixed(6)}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {typeof o.distance_in_km === "number" ? (
                      <span className="text-xs font-medium text-primary whitespace-nowrap">
                        {o.distance_in_km.toFixed(1)} km
                      </span>
                    ) : null}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
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
  ) : null;

  const renderProductsGrid = (colsClass: string, skeletonCount: number) => (
    <div className={`grid ${colsClass} gap-3`}>
      {isLoading ? (
        Array.from({ length: skeletonCount }).map((_, idx) => (
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
      ) : items.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3 text-muted-foreground">
            <PackageSearch className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {categoryFilter
              ? `No products found in "${categoryFilter}"`
              : searchQuery
              ? `No products found for "${searchQuery}"`
              : "No products available"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
            {categoryFilter
              ? "This shop may not have items in this category right now."
              : "Check back later or browse other nearby shops."}
          </p>
          {(categoryFilter || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("category");
                params.delete("q");
                setPage(1);
                navigate({
                  pathname: "/products",
                  search: params.toString() ? `?${params.toString()}` : "",
                });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        items.map((product, idx) => {
          const productId = String(product.id);
          const campaignPromoPrice = campaignPromoPrices.get(productId);
          const buyerPromoPrice = buyerPromoPrices.get(productId);
          const promoPrice = campaignPromoPrice ?? buyerPromoPrice ?? null;
          const hasPromo = promoPrice != null && Number.isFinite(promoPrice);
          // Prefer promo price when available; otherwise use catalog price.
          const displayPrice = hasPromo
            ? (promoPrice as number)
            : product.promotion_price != null
            ? product.promotion_price
            : product.normal_price;
          const originalPrice = hasPromo
            ? product.normal_price
            : product.promotion_price != null
            ? product.normal_price
            : undefined;
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
              promoBadge={
                campaignPromoProductIds.has(productId)
                  ? "campaign"
                  : buyerPromoProductIds.has(productId)
                  ? "buyer_promo"
                  : undefined
              }
              delay={idx * 25}
            />
          );
        })
      )}
    </div>
  );

  const paginationControls = pagination && pagination.total_pages > 1 ? (
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
        onClick={() => {
          setPage((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={isLoading || !pagination.has_next_page}
      >
        Next
      </Button>
    </div>
  ) : null;

  return (
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background pb-24">
          <Header />
          <main className="px-4 py-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
            {shopDetailsCard}
            {mobileCategoryDropdown}
            {renderProductsGrid("grid-cols-3", 12)}
            {paginationControls}
            {error && <p className="mt-3 text-xs text-muted-foreground">Failed to load inventories.</p>}
            {!cfg.apiToken && <p className="mt-2 text-xs text-muted-foreground">API token not configured.</p>}
            {!buyerIdParam && <div className="mt-6">{nearbyOutletsSection}</div>}
          </main>
          <BottomNav />
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background pb-28">
          <Header />
          <TabletContainer>
            <main className="py-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* Left Panel */}
                <div className="col-span-4 space-y-4">
                  {shopDetailsCard}
                  {desktopCategoryChips}
                  {!buyerIdParam && nearbyOutletsSection}
                </div>
                {/* Right Panel */}
                <div className="col-span-8 space-y-4">
                  {categoryFilter && (
                    <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border/60 text-xs shadow-xs">
                      <span>
                        Filtering by category: <strong className="text-foreground">{categoryFilter}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(null)}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear filter
                      </button>
                    </div>
                  )}
                  {renderProductsGrid("grid-cols-5", 20)}
                  {paginationControls}
                  {error && <p className="mt-3 text-xs text-muted-foreground">Failed to load inventories.</p>}
                  {!cfg.apiToken && <p className="mt-2 text-xs text-muted-foreground">API token not configured.</p>}
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


