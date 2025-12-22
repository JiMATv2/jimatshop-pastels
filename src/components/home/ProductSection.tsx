import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: "sale" | "new" | "fast";
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Red Apples",
    price: 5.99,
    originalPrice: 7.99,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop",
    badge: "sale",
  },
  {
    id: "2",
    name: "Organic Bananas",
    price: 3.49,
    unit: "1 bunch",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop",
    badge: "fast",
  },
  {
    id: "3",
    name: "Fresh Milk",
    price: 6.99,
    unit: "1L",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop",
    badge: "new",
  },
  {
    id: "4",
    name: "Farm Fresh Eggs",
    price: 8.99,
    originalPrice: 10.99,
    unit: "12 pcs",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop",
    badge: "sale",
  },
];

const popularProducts: Product[] = [
  {
    id: "5",
    name: "Chicken Breast",
    price: 12.99,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop",
  },
  {
    id: "6",
    name: "Broccoli",
    price: 4.49,
    originalPrice: 5.99,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=300&fit=crop",
    badge: "sale",
  },
  {
    id: "7",
    name: "Whole Wheat Bread",
    price: 4.99,
    unit: "1 loaf",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop",
  },
  {
    id: "8",
    name: "Orange Juice",
    price: 7.49,
    unit: "1L",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop",
    badge: "fast",
  },
];

interface ProductSectionProps {
  title: string;
  products: "featured" | "popular";
}

export const ProductSection = ({ title, products }: ProductSectionProps) => {
  const productList = products === "featured" ? featuredProducts : popularProducts;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <button className="text-sm text-primary font-medium">See All</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {productList.map((product, index) => (
          <ProductCard
            key={product.id}
            {...product}
            delay={index * 100}
          />
        ))}
      </div>
    </section>
  );
};
