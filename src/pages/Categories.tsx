import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buyerId = searchParams.get("buyer_id");

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["all-categories", buyerId ?? null],
    queryFn: async () => {
      if (buyerId) {
        const { data, error } = await supabase.rpc("get_buyer_product_categories", {
          buyer_id: buyerId,
        });
        if (error) throw error;
        return ((data ?? []) as Category[]).filter((category) => category?.name);
      }

      const { data, error } = await supabase
        .from("product_categories")
        .select("id,name,image_url,parent_id")
        .is("parent_id", null)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []).filter((category) => category?.name) as Category[];
    },
    staleTime: 5 * 60_000,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="px-4 py-4 max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Categories</h2>
          <span className="text-xs text-muted-foreground">Browse all categories</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="jimat-card p-3 flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-sm text-destructive">Failed to load categories.</div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-muted-foreground">No categories available.</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {categories.map((category, index) => {
              const initial = category.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
              const params = new URLSearchParams({
                section: "featured",
                category: category.name,
              });
              if (buyerId) {
                params.set("buyer_id", buyerId);
              }
              const search = params.toString();
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/products?${search}`)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-transform hover:scale-105 animate-fade-in bg-card"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-foreground">{initial}</span>
                  )}
                  <span className="text-xs font-medium text-foreground text-center line-clamp-2">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

