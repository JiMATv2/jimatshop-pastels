import { Home, Grid3X3, Heart, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const NavItem = ({ icon, label, to }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 py-2 px-4 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              "p-1.5 rounded-xl transition-colors",
              isActive && "bg-primary/10"
            )}
          >
            {icon}
          </div>
          <span className="text-xs font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" to="/" />
        <NavItem icon={<Grid3X3 className="w-5 h-5" />} label="Categories" to="/categories" />
        <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Orders" to="/orders" />
        <NavItem icon={<Heart className="w-5 h-5" />} label="Wishlist" to="/wishlist" />
        <NavItem icon={<User className="w-5 h-5" />} label="Profile" to="/profile" />
      </div>
    </nav>
  );
};
