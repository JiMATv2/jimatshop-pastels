import { ProductCard } from "./ProductCard";
import { getProductsBySection } from "@/lib/catalog/seed";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  fetchMobileProducts,
  getMobileProductsClientConfig,
  type MobileProduct,
} from "@/lib/api/mobileProducts";
import { useSelectedBuyerShop } from "@/lib/shop/selectedBuyerShop";

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
}

function toUiProduct(p: MobileProduct): Product {
  const price = p.promotion_price ?? p.normal_price;
  const originalPrice = p.promotion_price ? p.normal_price : undefined;
  const badge: Product["badge"] =
    p.promotion_price != null ? "sale" : p.is_fast_moving ? "fast" : p.is_featured ? "new" : undefined;

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

export const ProductSection = ({ title, products }: ProductSectionProps) => {
  const cfg = getMobileProductsClientConfig();
  const { buyerId } = useSelectedBuyerShop();
  const { data: productList = [], isLoading, error } = useQuery({
    queryKey: ["mobile-products", products, buyerId ?? null],
    queryFn: async () => {
      const loadLocal = async () => {
        const rows = await getProductsBySection(products);
        return (rows as any[])
          .map((row) => ({
            ...row,
            originalPrice: row.originalPrice ?? undefined,
            badge: row.badge ?? undefined,
          }))
          .slice(0, 4) as Product[];
      };

      // If token isn't configured, keep local seed catalog behavior (offline/dev friendly).
      if (!cfg.apiToken) return loadLocal();
      // Buyer-inventory requires a selected buyer shop to browse.
      if (!buyerId) return loadLocal();

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
            source: "buyer_inventory",
            buyer_id: buyerId,
          },
          cfg,
        );

        const filtered =
          products === "featured"
            ? resp.data.filter((p) => p.is_featured)
            : resp.data.filter((p) => p.is_fast_moving);

        const picked = filtered.length ? filtered : resp.data;
        return picked.map(toUiProduct).slice(0, 4);
      } catch (e) {
        console.warn("Mobile products API failed; falling back to local catalog", e);
        return loadLocal();
      }
    },
    staleTime: 60_000,
  });

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Link
          to={`/products?section=${products}`}
          className="text-sm text-primary font-medium"
        >
          See All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
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
          productList.map((product, index) => (
            <ProductCard key={product.id} {...product} delay={index * 100} />
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
