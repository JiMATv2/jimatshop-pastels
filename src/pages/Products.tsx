import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMobileProductsClientConfig } from "@/lib/api/mobileProducts";
import { fetchMobileInventories, type MobileProduct } from "@/lib/api/mobileInventories";
import { ProductCard } from "@/components/product/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";

type SectionKey = "featured" | "popular";

function parseSection(v: string | null): SectionKey {
  return v === "popular" ? "popular" : "featured";
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const section = useMemo(
    () => parseSection(searchParams.get("section")),
    [searchParams],
  );
  const buyerIdParam = searchParams.get("buyer_id"); // Single buyer ID from URL
  const { buyerIds: nearbyBuyerIds, outlets, isLoading: buyerIdsLoading, hasLocation } = useNearbyBuyerIds();
  
  // Use buyer_id from URL if provided, otherwise use nearby buyer IDs
  const buyerIds = buyerIdParam ? [buyerIdParam] : nearbyBuyerIds;
  const [page, setPage] = useState(1);

  // Find the specific buyer outlet info if buyer_id is provided
  const selectedBuyerOutlet = buyerIdParam 
    ? outlets.find((o) => String(o.id) === buyerIdParam)
    : null;

  const title = buyerIdParam
    ? selectedBuyerOutlet?.name 
      ? `${selectedBuyerOutlet.name} Products`
      : "Shop Products"
    : section === "featured"
    ? "🔥 Hot Deals (Nearby Inventories)"
    : "⭐ Popular (Nearby Inventories)";
  const cfg = getMobileProductsClientConfig();

  useEffect(() => {
    setPage(1);
  }, [section, buyerIds.join(",")]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mobile-inventories-page", section, buyerIds, page],
    queryFn: async () => {
      if (!cfg.apiToken) return { items: [] as MobileProduct[], pagination: undefined };
      // If buyer_id is provided, don't require location
      if (!buyerIdParam && (!hasLocation || buyerIds.length === 0))
        return { items: [] as MobileProduct[], pagination: undefined };

      // Debug: Log buyer IDs being sent
      console.debug("[Products] Fetching inventories for buyer_ids:", buyerIds);
      console.debug("[Products] Number of buyer IDs:", buyerIds.length);
      console.debug("[Products] Nearby outlets count:", outlets.length);
      console.debug("[Products] Buyer IDs array:", JSON.stringify(buyerIds));
      
      // Validation: Ensure we have multiple buyer IDs when not filtering by single buyer
      if (!buyerIdParam && buyerIds.length === 1) {
        console.warn("[Products] WARNING: Only 1 buyer ID found, expected multiple nearby buyers");
      }

      const resp = await fetchMobileInventories(
          {
            page,
            limit_count: 12,
            search_query: "",
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
        <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>

        {buyerIdParam && selectedBuyerOutlet ? (
          <section className="jimat-card p-3 mb-4">
            <div className="text-sm font-semibold text-foreground">
              {selectedBuyerOutlet.name || "Shop"}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {selectedBuyerOutlet.address || "—"}
            </div>
            {typeof selectedBuyerOutlet.distance_in_km === "number" && (
              <div className="text-xs font-medium text-primary mt-1">
                {selectedBuyerOutlet.distance_in_km.toFixed(1)} km away
              </div>
            )}
          </section>
        ) : (
          <section className="jimat-card p-3 mb-4">
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
                {items.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Showing {items.length} product{items.length !== 1 ? "s" : ""} from {buyerIds.length} {buyerIds.length === 1 ? "outlet" : "outlets"}
                    </div>
                  </div>
                )}
              </>
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
            items.map((product, idx) => (
              <ProductCard
                key={product.product_id}
                productId={product.product_id}
                productName={product.product_name}
                price={product.retail_price}
                coverImageUrl={product.cover_image_url}
                outletsWithStock={product.outlets_with_stock}
                totalOutlets={product.total_outlets}
                totalQuantitySold={product.total_quantity_sold}
                delay={idx * 25}
              />
            ))
          )}
        </div>

        {pagination && pagination.total_pages > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setPage((prev) => prev + 1)}
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
      </main>

      <BottomNav />
    </div>
  );
}


