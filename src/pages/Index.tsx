import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSection } from "@/components/home/ProductSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ShopperWidgets } from "@/components/home/ShopperWidgets";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { hasSeenOnboarding, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading && !hasSeenOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [isLoading, hasSeenOnboarding, navigate]);

  // Show nothing while checking onboarding status
  if (isLoading || !hasSeenOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-xl">J</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main>
        <ShopperWidgets />
        <section className="px-4">
          <Link
            to="/shops"
            className="block jimat-card p-4 bg-gradient-to-r from-jimat-green/10 to-jimat-pastelblue/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Browse Buyer Shops</div>
                <div className="text-xs text-muted-foreground">Select a shop to start shopping</div>
              </div>
              <span className="text-xs font-medium text-primary">See all</span>
            </div>
          </Link>
        </section>
        <HeroBanner />
        <CategoryGrid />
        <PromoBanner />
        <ProductSection title="🔥 Hot Deals" products="featured" />
        <ProductSection title="⭐ Popular Items" products="popular" />
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
