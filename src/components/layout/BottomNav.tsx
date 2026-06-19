import { Home, Grid3X3, Heart, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

const NavItem = ({ icon, label, to, badge }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 py-2 px-2 transition-colors relative",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              "p-1.5 md:p-2.5 rounded-xl transition-colors relative",
              isActive && "bg-primary/10"
            )}
          >
            {icon}
            {badge && badge > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] md:text-xs font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom safe-area-x">
      <div className="flex items-center justify-around max-w-md md:max-w-2xl mx-auto">
        <NavItem icon={<Home className="w-5 h-5 md:w-6 md:h-6" />} label="Home" to="/" />
        <NavItem icon={<Grid3X3 className="w-5 h-5 md:w-6 md:h-6" />} label="Browse" to="/categories" />
        <NavItem icon={<ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />} label="Orders" to="/orders" />
        <NavItem icon={<Heart className="w-5 h-5 md:w-6 md:h-6" />} label="Saved" to="/wishlist" />
        <NavItem icon={<User className="w-5 h-5 md:w-6 md:h-6" />} label="Profile" to="/profile" />
      </div>
    </nav>
  );
};
