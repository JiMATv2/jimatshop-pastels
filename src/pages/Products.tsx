import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProductCard } from "@/components/home/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductsBySection } from "@/lib/catalog/seed";
import {
  fetchMobileProducts,
  getMobileProductsClientConfig,
  type MobileProduct,
} from "@/lib/api/mobileProducts";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type SectionKey = "featured" | "popular";

type UiProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: "sale" | "new" | "fast";
};

function toUiProduct(p: MobileProduct): UiProduct {
  const price = p.promotion_price ?? p.normal_price;
  const originalPrice = p.promotion_price ? p.normal_price : undefined;
  const badge: UiProduct["badge"] =
    p.promotion_price != null
      ? "sale"
      : p.is_fast_moving
        ? "fast"
        : p.is_featured
          ? "new"
          : undefined;

  return {
    id: p.id,
    name: p.name,
    price,
    originalPrice,
    unit: p.brand_name ?? `Stock: ${p.stock_level}`,
    image: p.cover_image_url,
    badge,
  };
}

function parseSection(v: string | null): SectionKey {
  return v === "popular" ? "popular" : "featured";
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const section = useMemo(
    () => parseSection(searchParams.get("section")),
    [searchParams],
  );

  const title = section === "featured" ? "🔥 Hot Deals" : "⭐ Popular Items";
  const cfg = getMobileProductsClientConfig();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["mobile-products-page", section],
    queryFn: async () => {
      const loadLocal = async () => {
        const rows = await getProductsBySection(section);
        return (rows as any[]).map((row) => ({
          ...row,
          originalPrice: row.originalPrice ?? undefined,
          badge: row.badge ?? undefined,
        })) as UiProduct[];
      };

      if (!cfg.apiToken) return loadLocal();

      try {
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
          },
          cfg,
        );

        const filtered =
          section === "featured"
            ? resp.data.filter((p) => p.is_featured)
            : resp.data.filter((p) => p.is_fast_moving);
        const picked = filtered.length ? filtered : resp.data;
        return picked.map(toUiProduct);
      } catch (e) {
        console.warn("Mobile products API failed; falling back to local catalog", e);
        return loadLocal();
      }
    },
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>

        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="jimat-card">
                <div className="p-3 space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            items.map((p, idx) => <ProductCard key={p.id} {...p} delay={idx * 25} />)
          )}
        </div>

        {error ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Failed to load from API. Showing offline fallback if available.
          </p>
        ) : null}

        {!cfg.apiToken ? (
          <p className="mt-2 text-xs text-muted-foreground">
            API token not configured (VITE_SUPABASE_API_TOKEN) — using offline catalog.
          </p>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}


