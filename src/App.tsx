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
import RefundRequest from "./pages/RefundRequest";
import Shops from "./pages/Shops";
import Categories from "./pages/Categories";
import Onboarding from "./pages/Onboarding";
import Checkout from "./pages/Checkout";
import JimatshopCoins from "./pages/JimatshopCoins";
import JimatshopCoinTransactions from "./pages/JimatshopCoinTransactions";
import LocationSearch from "./pages/LocationSearch";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import JimatshopCampaignDetails from "./pages/JimatshopCampaignDetails";
import UserGuide from "./pages/UserGuide";
import { CapacitorBackHandler } from "@/components/layout/CapacitorBackHandler";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { CartProvider } from "@/lib/cart/CartProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { PushPermissionDialog } from "@/components/notifications/PushPermissionDialog";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CapacitorBackHandler />
            <PushPermissionDialog />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/inventory/:inventoryId" element={<InventoryDetails />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderDetails />} />
              <Route path="/orders/:orderId/refund" element={<RefundRequest />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/campaigns/:campaignId" element={<JimatshopCampaignDetails />} />
              <Route path="/jimatshop-coins" element={<JimatshopCoins />} />
              <Route path="/jimatshop-coins/:coinId" element={<JimatshopCoinTransactions />} />
              <Route path="/location-search" element={<LocationSearch />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/user-guide" element={<UserGuide />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
