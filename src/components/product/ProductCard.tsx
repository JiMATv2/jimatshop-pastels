import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export type ProductCardProps = {
  productId: string;
  productName: string;
  price: number;
  coverImageUrl: string;
  outletsWithStock: number;
  totalOutlets: number;
  totalQuantitySold?: number;
  delay?: number;
};

export function ProductCard({
  productId,
  productName,
  price,
  coverImageUrl,
  outletsWithStock,
  totalOutlets,
  totalQuantitySold,
  delay = 0,
}: ProductCardProps) {
  const navigate = useNavigate();
  const displayPrice = typeof price === "number" ? price : Number(price);

  return (
    <div
      className={cn("jimat-card animate-slide-up cursor-pointer")}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(`/product/${productId}`)}
    >
      <div className="relative p-3">
        <div className="aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center overflow-hidden">
          <img
            src={coverImageUrl || "https://via.placeholder.com/400"}
            alt={productName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
            {productName}
          </h4>
          <p className="text-xs text-muted-foreground">
            {outletsWithStock > 0 ? `${outletsWithStock} outlet${outletsWithStock > 1 ? "s" : ""} in stock` : "Out of stock"}
          </p>
          {totalOutlets > 0 && (
            <p className="text-xs text-muted-foreground">
              Available at {totalOutlets} outlet{totalOutlets > 1 ? "s" : ""}
            </p>
          )}
          {typeof totalQuantitySold === "number" && totalQuantitySold > 0 && (
            <p className="text-xs text-muted-foreground">Sold: {totalQuantitySold}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-bold text-primary">
              RM{Number.isFinite(displayPrice) ? displayPrice.toFixed(2) : "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

