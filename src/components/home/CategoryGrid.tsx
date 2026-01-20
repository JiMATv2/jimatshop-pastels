import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

export const CategoryGrid = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id,name,image_url")
        .is("parent_id", null)
        .order("name", { ascending: true })
        .limit(8);

      if (error) throw error;
      return (data ?? []).filter((category) => category?.name);
    },
    staleTime: 5 * 60_000,
  });

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
        <button className="text-sm text-primary font-medium">See All</button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading categories…</div>
      ) : isError ? (
        <div className="text-sm text-destructive">Failed to load categories.</div>
      ) : categories.length === 0 ? (
        <div className="text-sm text-muted-foreground">No categories available.</div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category, index) => {
            const initial = category.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
            const search = new URLSearchParams({
              section: "featured",
              category: category.name,
            }).toString();
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/products?${search}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-transform hover:scale-105 animate-fade-in bg-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="h-8 w-8 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-lg font-semibold text-foreground">{initial}</span>
                )}
                <span className="text-xs font-medium text-foreground">{category.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
