import { Truck, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above RM50",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Within 2 hours",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
];

export const PromoBanner = () => {
  return (
    <section className="px-4 py-4">
      <div className="bg-pastel-gradient-1 rounded-2xl p-4">
        <div className="grid grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center mb-2 shadow-sm">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                {feature.title}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
