import { Home, Grid3X3, Heart, User, ShoppingBag, Store, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, Link } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

const MobileNavItem = ({ icon, label, to, badge }: NavItemProps) => {
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
              "p-1.5 rounded-xl transition-colors relative",
              isActive && "bg-primary/10"
            )}
          >
            {icon}
            {badge && badge > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
};

const DesktopNavItem = ({ icon, label, to, badge }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-start gap-1 md:gap-1 lg:gap-3.5 px-2 md:px-1 lg:px-3.5 py-2 md:py-2 lg:py-2.5 rounded-xl transition-all relative group",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative shrink-0 flex items-center justify-center">
            {icon}
            {badge && badge > 0 ? (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] md:text-[11px] lg:text-sm font-medium tracking-tight">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};

export const BottomNav = ({ className }: { className?: string } = {}) => {
  return (
    <>
      {/* 1. Mobile Bottom Navigation: hidden on desktop view (md:hidden) */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom safe-area-x md:hidden",
          className
        )}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <MobileNavItem icon={<Home className="w-5 h-5" />} label="Home" to="/" />
          <MobileNavItem icon={<Grid3X3 className="w-5 h-5" />} label="Browse" to="/categories" />
          <MobileNavItem icon={<ShoppingBag className="w-5 h-5" />} label="Orders" to="/orders" />
          <MobileNavItem icon={<Heart className="w-5 h-5" />} label="Saved" to="/wishlist" />
          <MobileNavItem icon={<User className="w-5 h-5" />} label="Profile" to="/profile" />
        </div>
      </nav>

      {/* 2. Desktop Left Sidebar Navigation: visible on desktop/tablet (hidden md:flex) */}
      <aside
        className="desktop-side-nav hidden md:flex fixed left-0 top-0 bottom-0 z-40 md:w-20 lg:w-60 bg-card border-r border-border flex-col justify-between py-5 px-2.5 shadow-sm select-none"
        aria-label="Desktop Sidebar Navigation"
      >
        <div className="flex flex-col gap-5">
          {/* Brand header */}
          <Link
            to="/"
            className="flex items-center md:justify-center lg:justify-start gap-3 px-2 py-1 transition-opacity hover:opacity-90"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-primary-foreground font-bold text-lg">J</span>
            </div>
            <div className="hidden lg:flex flex-col min-w-0">
              <span className="font-bold text-base text-foreground tracking-tight leading-tight">JiMATShop</span>
              <span className="text-[11px] text-muted-foreground font-medium">Fresh Groceries</span>
            </div>
          </Link>

          {/* Primary Nav Items */}
          <nav className="flex flex-col gap-1">
            <DesktopNavItem icon={<Home className="w-5 h-5" />} label="Home" to="/" />
            <DesktopNavItem icon={<Grid3X3 className="w-5 h-5" />} label="Browse" to="/categories" />
            <DesktopNavItem icon={<ShoppingBag className="w-5 h-5" />} label="Orders" to="/orders" />
            <DesktopNavItem icon={<Heart className="w-5 h-5" />} label="Saved" to="/wishlist" />
            <DesktopNavItem icon={<User className="w-5 h-5" />} label="Profile" to="/profile" />
          </nav>
        </div>

        {/* Secondary Links at the bottom of the sidebar */}
        <div className="flex flex-col gap-1 pt-3 border-t border-border/70">
          <NavLink
            to="/shops"
            className={({ isActive }) =>
              cn(
                "flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-start gap-1 lg:gap-3.5 px-2 lg:px-3.5 py-2 rounded-xl transition-all relative text-muted-foreground hover:text-foreground hover:bg-muted/70",
                isActive && "bg-primary/10 text-primary font-semibold"
              )
            }
            title="Browse Shops"
          >
            <Store className="w-5 h-5 shrink-0" />
            <span className="text-[10px] md:text-[11px] lg:text-sm font-medium">Shops</span>
          </NavLink>
          <NavLink
            to="/user-guide"
            className={({ isActive }) =>
              cn(
                "flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-start gap-1 lg:gap-3.5 px-2 lg:px-3.5 py-2 rounded-xl transition-all relative text-muted-foreground hover:text-foreground hover:bg-muted/70",
                isActive && "bg-primary/10 text-primary font-semibold"
              )
            }
            title="User Guide"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] md:text-[11px] lg:text-sm font-medium">Guide</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
