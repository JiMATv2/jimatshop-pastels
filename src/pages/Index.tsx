import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSection } from "@/components/home/ProductSection";
import { PromoBanner } from "@/components/home/PromoBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main>
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
