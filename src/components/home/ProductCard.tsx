import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  variant?: "mobile" | "tablet";
  isMock?: boolean;
  onMockClick?: () => void;
}

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  unit,
  image,
  badge,
  delay = 0,
  variant = "mobile",
  isMock = false,
  onMockClick,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleCardClick = () => {
    if (isMock) {
      onMockClick?.();
      return;
    }
    navigate(`/product/${id}`);
  };

  const isTablet = variant === "tablet";

  return (
    <div
      className="jimat-card animate-slide-up cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleCardClick}
    >
      <div className={isTablet ? "relative p-4" : "relative p-3"}>
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
        <button className={isTablet ? "absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors" : "absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"}>
          <Heart className={isTablet ? "w-5 h-5 text-muted-foreground" : "w-4 h-4 text-muted-foreground"} />
        </button>

        {/* Image */}
        <div className={isTablet ? "aspect-square bg-muted rounded-2xl mb-4 flex items-center justify-center overflow-hidden" : "aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center overflow-hidden"}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h4 className={isTablet ? "text-base font-medium text-foreground line-clamp-2 min-h-[2.75rem]" : "text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]"}>
            {name}
          </h4>
          <p className={isTablet ? "text-sm text-muted-foreground" : "text-xs text-muted-foreground"}>{unit}</p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-1">
              <span className={isTablet ? "text-lg font-bold text-primary" : "text-base font-bold text-primary"}>
                RM{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className={isTablet ? "text-sm text-muted-foreground line-through" : "text-xs text-muted-foreground line-through"}>
                  RM{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
