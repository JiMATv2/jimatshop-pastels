import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient rounded-2xl mx-4 my-4 p-6 animate-fade-in">
      <div className="relative z-10">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
          🎉 Limited Time Offer
        </span>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Fresh Groceries
          <br />
          <span className="text-primary">Up to 30% OFF</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Get fresh produce delivered to your doorstep
        </p>
        <Button className="group">
          Shop Now
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-24 h-24 bg-jimat-lightgreen/30 rounded-full blur-2xl" />
      <div className="absolute bottom-4 right-8 w-16 h-16 bg-jimat-pastelpeach/50 rounded-full blur-xl" />
    </section>
  );
};
