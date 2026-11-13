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
  variant?: "mobile" | "tablet" | "desktop";
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

  const isDesktop = variant === "desktop";
  const isTablet = variant === "tablet";

  return (
    <div
      className="jimat-card cursor-pointer"
      onClick={handleCardClick}
    >
      <div className={cn("relative", isDesktop ? "p-2.5 sm:p-3" : isTablet ? "p-4" : "p-3")}>
        {/* Badge */}
        {badge && (
          <span
            className={cn(
              "jimat-badge absolute top-2 left-2 z-10",
              isDesktop && "text-[10px] px-2 py-0.5",
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
        <button
          className={cn(
            "absolute z-10 rounded-full bg-background/95 border border-border/40 hover:bg-background transition-colors shadow-xs",
            isDesktop ? "top-2 right-2 p-1.5" : isTablet ? "top-3 right-3 p-2" : "top-2 right-2 p-1.5"
          )}
        >
          <Heart className={isTablet && !isDesktop ? "w-5 h-5 text-muted-foreground" : "w-4 h-4 text-muted-foreground"} />
        </button>

        {/* Image */}
        <div
          className={cn(
            "aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden",
            isDesktop ? "mb-2 sm:mb-2.5" : isTablet ? "rounded-2xl mb-4" : "mb-3"
          )}
        >
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== `${window.location.origin}/placeholder.svg` && !target.src.endsWith("/placeholder.svg")) {
                target.src = "/placeholder.svg";
              }
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h4
            className={cn(
              "font-medium text-foreground line-clamp-2 leading-snug",
              isDesktop ? "text-xs sm:text-sm min-h-[2.25rem] sm:min-h-[2.5rem]" : isTablet ? "text-base min-h-[2.75rem]" : "text-sm min-h-[2.5rem]"
            )}
          >
            {name}
          </h4>
          <p className={cn("text-muted-foreground truncate", isDesktop ? "text-[11px] sm:text-xs" : isTablet ? "text-sm" : "text-xs")}>{unit}</p>

          <div className="flex items-center justify-between pt-1 sm:pt-2">
            <div className="flex items-baseline gap-1">
              <span className={cn("font-bold text-primary", isDesktop ? "text-sm sm:text-base" : isTablet ? "text-lg" : "text-base")}>
                RM{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className={cn("text-muted-foreground line-through", isDesktop ? "text-[11px] sm:text-xs" : isTablet ? "text-sm" : "text-xs")}>
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
