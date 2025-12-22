import { Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: "sale" | "new" | "fast";
  delay?: number;
}

export const ProductCard = ({
  name,
  price,
  originalPrice,
  unit,
  image,
  badge,
  delay = 0,
}: ProductCardProps) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div
      className="jimat-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative p-3">
        {/* Badge */}
        {badge && (
          <span
            className={cn(
              "jimat-badge absolute top-2 left-2 z-10",
              badge === "sale" && "jimat-badge-sale",
              badge === "new" && "jimat-badge-new",
              badge === "fast" && "jimat-badge-fast"
            )}
          >
            {badge === "sale" && `-${discount}%`}
            {badge === "new" && "New"}
            {badge === "fast" && "Fast Moving"}
          </span>
        )}

        {/* Wishlist */}
        <button className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
          <Heart className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Image */}
        <div className="aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
            {name}
          </h4>
          <p className="text-xs text-muted-foreground">{unit}</p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-primary">
                RM{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  RM{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button size="icon" className="h-8 w-8 rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
