import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/CartProvider";

type CartIconButtonProps = {
  className?: string;
  "aria-label"?: string;
};

export function CartIconButton({
  className,
  "aria-label": ariaLabel = "Go to checkout",
}: CartIconButtonProps) {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative ${className ?? ""}`}
      aria-label={ariaLabel}
      onClick={() => navigate("/checkout")}
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Button>
  );
}
