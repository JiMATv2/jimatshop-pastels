import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const categories: Category[] = [
  { id: "1", name: "Fruits", emoji: "🍎", color: "bg-jimat-pastelpeach" },
  { id: "2", name: "Vegetables", emoji: "🥬", color: "bg-jimat-pastelsage" },
  { id: "3", name: "Dairy", emoji: "🥛", color: "bg-jimat-pastelblue" },
  { id: "4", name: "Meat", emoji: "🥩", color: "bg-jimat-pastelpeach" },
  { id: "5", name: "Bakery", emoji: "🍞", color: "bg-jimat-pastellavender" },
  { id: "6", name: "Drinks", emoji: "🧃", color: "bg-jimat-pastelblue" },
  { id: "7", name: "Snacks", emoji: "🍿", color: "bg-jimat-pastelsage" },
  { id: "8", name: "More", emoji: "➕", color: "bg-muted" },
];

export const CategoryGrid = () => {
  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
        <button className="text-sm text-primary font-medium">See All</button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category, index) => (
          <button
            key={category.id}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-2xl transition-transform hover:scale-105 animate-fade-in",
              category.color
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-2xl">{category.emoji}</span>
            <span className="text-xs font-medium text-foreground">{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
