import { Home, Grid3X3, Heart, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ icon, label, active }: NavItemProps) => (
  <button
    className={cn(
      "flex flex-col items-center gap-1 py-2 px-4 transition-colors",
      active ? "text-primary" : "text-muted-foreground"
    )}
  >
    <div className={cn(
      "p-1.5 rounded-xl transition-colors",
      active && "bg-primary/10"
    )}>
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" active />
        <NavItem icon={<Grid3X3 className="w-5 h-5" />} label="Categories" />
        <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Orders" />
        <NavItem icon={<Heart className="w-5 h-5" />} label="Wishlist" />
        <NavItem icon={<User className="w-5 h-5" />} label="Profile" />
      </div>
    </nav>
  );
};
