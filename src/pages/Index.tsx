import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSection } from "@/components/home/ProductSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ShopperWidgets } from "@/components/home/ShopperWidgets";
import { NearbyOutlets } from "@/components/home/NearbyOutlets";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Link } from "react-router-dom";
import { ResponsivePage, TabletContainer } from "@/components/layout/ResponsivePageShell";

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
    <ResponsivePage
      mobile={
        <div className="min-h-screen bg-background pb-24">
          <Header />
          <main>
            <ProductSection title="🔥 Hot Deals" products="featured" />
            <ProductSection title="⭐ Popular Items" products="popular" />
            <NearbyOutlets />
            <HeroBanner />
            <CategoryGrid />
          </main>
          <BottomNav />
        </div>
      }
      tablet={
        <div className="min-h-screen bg-background pb-28">
          <Header />
          <TabletContainer>
            <main className="space-y-4 py-4">
              <HeroBanner />

              {/** md–lg: stacked professional layout */}
              <div className="block lg:hidden space-y-4">
                <CategoryGrid variant="tablet" />
                <ProductSection title="🔥 Hot Deals" products="featured" variant="tablet" />
                <ProductSection title="⭐ Popular Items" products="popular" variant="tablet" />
                <NearbyOutlets variant="tablet" />
              </div>

              {/** lg+: two-column layout */}
              <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-8 space-y-4">
                  <ProductSection title="🔥 Hot Deals" products="featured" variant="tablet" />
                  <ProductSection title="⭐ Popular Items" products="popular" variant="tablet" />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <CategoryGrid variant="tablet" />
                  <NearbyOutlets variant="tablet" />
                </div>
              </div>
            </main>
          </TabletContainer>
          <BottomNav />
        </div>
      }
    />
  );
};

export default Index;
