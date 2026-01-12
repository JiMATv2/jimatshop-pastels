import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import InventoryDetails from "./pages/InventoryDetails";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Shops from "./pages/Shops";
import Onboarding from "./pages/Onboarding";
import Checkout from "./pages/Checkout";
import LocationSearch from "./pages/LocationSearch";
import NotFound from "./pages/NotFound";
import { CapacitorBackHandler } from "@/components/layout/CapacitorBackHandler";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { CartProvider } from "@/lib/cart/CartProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CapacitorBackHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/inventory/:inventoryId" element={<InventoryDetails />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/location-search" element={<LocationSearch />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
