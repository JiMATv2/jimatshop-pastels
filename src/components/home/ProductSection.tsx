import { ProductCard } from "./ProductCard";
import { getProductsBySection } from "@/lib/catalog/seed";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  fetchMobileProducts,
  getMobileProductsClientConfig,
  type MobileProduct,
} from "@/lib/api/mobileProducts";
import { useNearbyBuyerIds } from "@/lib/shop/useNearbyBuyerIds";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: "sale" | "new" | "fast";
}

interface ProductSectionProps {
  title: string;
  products: "featured" | "popular";
  variant?: "mobile" | "tablet";
  onMockProductClick?: () => void;
}

function toUiProduct(p: MobileProduct): Product {
  const price = p.promotion_price ?? p.normal_price;
  const originalPrice = p.promotion_price ? p.normal_price : undefined;
  const badge: Product["badge"] =
    p.promotion_price != null ? "sale" : p.is_fast_moving ? "fast" : p.is_featured ? "new" : undefined;

  const sold = (p.products_sold ?? 0) as number;
  const stock = (p.stock_level ?? 0) as number;
  const brand = p.brand_name ? String(p.brand_name) : null;
  // Keep this as the `unit` line in ProductCard (small text). Show sold + stock for buyer-inventory browsing.
  const unit = brand ? `${brand} · Sold: ${sold} · Stock: ${stock}` : `Sold: ${sold} · Stock: ${stock}`;

  return {
    id: p.id,
    name: p.name,
    price,
    originalPrice,
    unit,
    image: p.cover_image_url,
    badge,
  };
}

export const ProductSection = ({ title, products, variant = "mobile", onMockProductClick }: ProductSectionProps) => {
  const cfg = getMobileProductsClientConfig();
  const { buyerIds, isLoading: buyerIdsLoading, hasLocation } = useNearbyBuyerIds();
  // Track whether the currently displayed products came from the API or the local seed
  // catalog. We can't safely infer this from location state alone because the local
  // catalog is also used on error or when no nearby buyers are found.
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);
  const { data: productList = [], isLoading, error } = useQuery({
    queryKey: ["mobile-products", products, buyerIds],
    queryFn: async () => {
      const loadLocal = async () => {
        type LocalProductRow = {
          id: string;
          name: string;
          price: number;
          originalPrice?: number | null;
          unit: string;
          image: string;
          badge?: Product["badge"] | null;
        };
        const rows = (await getProductsBySection(products)) as LocalProductRow[];
        return rows
          .map((row) => ({
            ...row,
            originalPrice: row.originalPrice ?? undefined,
            badge: row.badge ?? undefined,
          }))
          .slice(0, 12) as Product[];
      };

      // If token isn't configured, keep local seed catalog behavior (offline/dev friendly).
      if (!cfg.apiToken) {
        setDataSource("local");
        return loadLocal();
      }
      // Buyer-inventory requires nearby buyer shops (from location).
      if (!hasLocation || !buyerIds || buyerIds.length === 0) {
        setDataSource("local");
        console.debug("[ProductSection] No nearby buyers, using local catalog", {
          hasLocation,
          buyerIdsCount: buyerIds?.length ?? 0,
        });
        return loadLocal();
      }

      try {
        console.debug("[ProductSection] Fetching products for buyer_ids:", buyerIds);
        const resp = await fetchMobileProducts(
          {
            page: 1,
            limit_count: 24,
            search_query: "",
            category_filter: "All Categories",
            subcategory_filter: "All Subcategories",
            brand_filter: "All Brands",
            use_semantic_search: true,
            semantic_threshold: 0.2,
            source: "buyer_inventory",
            buyer_ids: buyerIds, // Use array of buyer IDs from nearby outlets
          },
          cfg,
        );

        const filtered =
          products === "featured"
            ? resp.data.filter((p) => p.is_featured)
            : resp.data.filter((p) => p.is_fast_moving);

        const picked = filtered.length ? filtered : resp.data;
        setDataSource("api");
        return picked.map(toUiProduct).slice(0, 12);
      } catch (e) {
        setDataSource("local");
        console.warn("Mobile products API failed; falling back to local catalog", e);
        return loadLocal();
      }
    },
    enabled: !buyerIdsLoading, // Wait for buyer IDs to load
    staleTime: 60_000,
  });



  // The local seed catalog (e.g. "Fresh Red Apples") is mock/demo data. Any time we
  // render those products we should prompt the user to set a location first.
  const isMockCatalog = dataSource === "local";

  console.debug("[ProductSection] render", {
    title,
    variant,
    dataSource,
    isMockCatalog,
    hasLocation,
    buyerIdsCount: buyerIds.length,
    apiTokenConfigured: Boolean(cfg.apiToken),
  });

  const isTablet = variant === "tablet";

  return (
    <section className={isTablet ? "py-4" : "px-4 py-4"}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={isTablet ? "text-xl font-semibold text-foreground" : "text-lg font-semibold text-foreground"}>{title}</h3>
        <Link
          to={`/products?section=${products}`}
          className="text-sm text-primary font-medium"
        >
          See All
        </Link>
      </div>

      <div
        className={
          isTablet
            ? "grid grid-cols-4 gap-4"
            : "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
        }
      >
        {isLoading || buyerIdsLoading ? (
          Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="jimat-card">
              <div className={isTablet ? "p-4 space-y-3" : "p-3 space-y-3"}>
                <Skeleton className="aspect-square rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className={isTablet ? "h-5 w-4/5" : "h-4 w-4/5"} />
                  <Skeleton className={isTablet ? "h-4 w-2/5" : "h-3 w-2/5"} />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className={isTablet ? "h-6 w-28" : "h-5 w-24"} />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          productList.map((product, index) => (
            <ProductCard
              key={product.id}
              {...product}
              delay={index * 100}
              variant={variant}
              isMock={isMockCatalog}
              onMockClick={onMockProductClick}
            />
          ))
        )}
      </div>

      {error ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Failed to load products. Showing cached/previous data if available.
        </p>
      ) : null}

      {!cfg.apiToken ? (
        <p className="mt-2 text-xs text-muted-foreground">
          API token not configured (VITE_SUPABASE_API_TOKEN) — using offline catalog.
        </p>
      ) : null}
    </section>
  );
};
