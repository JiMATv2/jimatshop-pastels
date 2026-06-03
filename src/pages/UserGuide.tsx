import React, { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MapPin,
  ShoppingBag,
  Coins,
  MessageSquare,
  User,
  Compass,
  ArrowLeft,
  Info,
  Heart,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface GuideSection {
  id: string;
  title: string;
  tabLabel: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function UserGuide() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  const guideSections: GuideSection[] = [
    {
      id: "introduction",
      title: "Welcome to JimatShop",
      tabLabel: "Introduction",
      icon: <Compass className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Welcome to the JimatShop Shopper App</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            JimatShop is designed to help you buy groceries at wholesale prices directly from local distributor outlets. This guide will walk you through the key features to help you save on your regular grocery runs.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-primary flex items-center gap-2 text-base">
              <Info className="w-5 h-5" /> What You'll Learn
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground/80">
              <li className="flex items-center gap-2">• Creating accounts & logging in</li>
              <li className="flex items-center gap-2">• Setting search location</li>
              <li className="flex items-center gap-2">• Browsing & Following local shops</li>
              <li className="flex items-center gap-2">• Using loyalty coins for checkout</li>
              <li className="flex items-center gap-2">• Messaging shops in real-time</li>
              <li className="flex items-center gap-2">• Tracking orders, re-buying, & refunds</li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_welcome.png"
              alt="JimatShop Home Screen Overview"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Welcome Screen Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the home page showing the main catalog/widgets, then save as <code>public/guide_welcome.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "auth-onboarding",
      title: "Onboarding & Authentication",
      tabLabel: "Onboarding & Sign-In",
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Sign In & Authentication</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Logging into JimatShop unlocks your profile settings, allows you to save favorite products, manages your coin wallets, and lets you track active orders.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start border-l-4 border-primary pl-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Onboarding Carousel</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  First-time users swipe through introduction slides summarizing wholesale benefits and rapid delivery.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start border-l-4 border-primary pl-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Google Sign-In</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Single-tap login using Google Identity Services. On Android and iOS mobile platforms, Native Google Sign-In is triggered seamlessly.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start border-l-4 border-primary pl-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Guest Mode</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Click "Teruskan sebagai tetamu" to explore the catalog before setting up your profile credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_onboarding.png"
              alt="Sign In & Onboarding Options"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Onboarding Screen Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the login / onboarding slide screen, then save as <code>public/guide_onboarding.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "location",
      title: "Location-Based Discovery",
      tabLabel: "Location Setup",
      icon: <MapPin className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Setting Your Location</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Because JimatShop coordinates with nearby distributor inventories, it is vital to configure your physical location.
          </p>

          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> How to set your address:
              </h3>
              <ol className="list-decimal list-inside text-sm text-muted-foreground mt-2 space-y-2">
                <li>Tap the location marker button underneath the logo in the Header.</li>
                <li>Enter your city, street name, or postcode in the search query.</li>
                <li>Select from the suggested address list or configure pinpoint coordinates.</li>
                <li>Press save to load local shops in your vicinity automatically.</li>
              </ol>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_location.png"
              alt="Location Search Page"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Location Screen Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the location search autocomplete page, then save as <code>public/guide_location.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "following-reorder",
      title: "Following Outlets & Fast Re-ordering",
      tabLabel: "Follow & Re-order",
      icon: <Heart className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Following Shops & Easy Re-buying</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Enhance your shopping experience by following your favorite distributor outlets (retailers) and placing repeating grocery orders quickly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-5 rounded-2xl border space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Following Outlets
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When browsing a specific retailer’s store catalog (`/products?buyer_id=...`), click the <strong>Follow</strong> button to store this outlet under your preferred shops list.
              </p>
              <p className="text-[10.5px] text-muted-foreground bg-muted p-2 rounded-lg font-mono">
                Saves relationship to the <code>buyer_followers</code> table, linking your shopper profile to the seller.
              </p>
            </div>

            <div className="bg-card p-5 rounded-2xl border space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <ShoppingBag className="w-4 h-4 text-primary" /> Buy Again Button
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Repurchasing regular groceries is seamless. In your <strong>Order History</strong>, each completed product item lists a <strong>Buy again</strong> button.
              </p>
              <p className="text-[10.5px] text-muted-foreground bg-muted p-2 rounded-lg font-mono">
                Clicking redirectively navigates to that product's specific inventory profile page, so you can re-add it to your cart.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_following.png"
              alt="Following outlets and buy again options"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Follow Outlets Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the product details page showing the followed outlet and follow status, then save as <code>public/guide_following.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cart-checkout",
      title: "Cart & Checkout Management",
      tabLabel: "Cart & Checkout",
      icon: <ShoppingBag className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Shopping Cart & Placing Orders</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Manage product items, adjust quantities, review subtotals, and select store fulfillment instructions at Checkout.
          </p>

          <div className="bg-card p-5 rounded-2xl border space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" /> Key Checkout Features
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Multi-Shop Support:</strong> Items from multiple shops in the cart will automatically create separate merchant orders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Fulfillment Notes:</strong> Write instructions (e.g. pickup time, packing preferences) in the notes area.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Self-Pickup:</strong> Currently, orders default to customer self-pickup at the respective shop outlets.</span>
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_checkout.png"
              alt="Checkout Page Overview"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Checkout Screen Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the checkout summary and notes form, then save as <code>public/guide_checkout.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "payments-coins",
      title: "Loyalty Coins & Payment Gateways",
      tabLabel: "Payments & Coins",
      icon: <Coins className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Fulfillment Payments & Wallet Balance</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            JimatShop has multiple payment types depending on your convenience and reward balances.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-xl border">
              <h4 className="font-semibold text-foreground text-sm">Pay In Store</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Cash or card payments at the distributor counter when you collect your order.
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border">
              <h4 className="font-semibold text-foreground text-sm">JiMATShop Coins (Store-specific)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Loyalty credits tied directly to a specific merchant. These can only be spent at the distributor outlet where they were issued.
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border">
              <h4 className="font-semibold text-foreground text-sm">Platform Coins (Global)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Universal coin tokens that are redeemable at any participating retailer outlet across the platform.
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border">
              <h4 className="font-semibold text-foreground text-sm">Billplz Gateway</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Secure online FPX banking. Redirects to your bank portal upon checkout submission.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_coins.png"
              alt="JiMATShop Wallet Overview"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Coins className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Coins Wallet Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the user profile coins ledger or transactions list, then save as <code>public/guide_coins.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "support-chat-refunds",
      title: "Real-Time Chat & Refund Claims",
      tabLabel: "Chat & Refunds",
      icon: <MessageSquare className="w-4 h-4" />,
      content: (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Chat Support & Order Refund Requests</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Connect directly with outlet managers or file claims for missing, damaged, or incorrect grocery deliveries.
          </p>

          <div className="space-y-4">
            <div className="bg-card p-5 rounded-2xl border space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <MessageSquare className="w-4.5 h-4.5 text-primary" /> Real-time Chat Channels
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our messaging service is built on real-time Phoenix websockets channel subscriptions (<code>chat:rooms</code> and <code>chat:room:uuid</code>). This ensures instant message delivery to merchants, and active badge updates.
              </p>
            </div>

            <div className="bg-card p-5 rounded-2xl border space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <RotateCcw className="w-4.5 h-4.5 text-rose-500" /> Refund Request Pipeline
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If an order is packed incorrectly or contains damaged items, you can file a refund request. You will provide the quantities to refund, reasons, and photo evidence.
              </p>
              <p className="text-[10.5px] text-muted-foreground bg-muted p-2 rounded-lg font-mono">
                Inserts data into the <code>refund_request</code> and <code>refund_items</code> tables. Payout values are automatically balanced in the merchant's statement ledger once approved by the administrator.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-1">
            <img
              src="/guide_chat.png"
              alt="Real-time Chat Screen"
              className="w-full h-auto max-h-[350px] object-contain rounded-xl bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".img-placeholder");
                  if (placeholder) placeholder.classList.remove("hidden");
                }
              }}
            />
            <div className="img-placeholder hidden py-16 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Chat & Support Screen Placeholder</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Capture the chat conversation panel or refund request modal, then save as <code>public/guide_chat.png</code>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleNext = () => {
    if (activeSection < guideSections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              data-testid="guide-back-btn"
              onClick={() => navigate("/profile")}
              aria-label="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary-foreground w-4 h-4" />
              </div>
              <div>
                <h1 className="text-md font-bold text-foreground">User Guide</h1>
                <p className="text-[10px] text-muted-foreground">Shopper App Documentation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Splitscreen Layout */}
      <div className="flex-1 max-w-5xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4">
        {/* Left Sidebar Table of Contents */}
        <aside className="w-full md:w-64 bg-card border rounded-2xl p-4 flex flex-col h-fit space-y-4 shrink-0">
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-foreground/80 px-2 uppercase tracking-wider text-[11px]">
              Table of Contents
            </h2>
          </div>

          <ScrollArea className="max-h-[250px] md:max-h-none overflow-y-auto">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {guideSections.map((section, idx) => (
                <button
                  key={section.id}
                  data-testid={`guide-tab-${section.id}`}
                  onClick={() => setActiveSection(idx)}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 w-full text-left",
                    activeSection === idx
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.01]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="shrink-0">{section.icon}</span>
                  <span className="hidden md:inline">{section.tabLabel}</span>
                  <span className="md:hidden">{section.tabLabel.split(" ")[0]}</span>
                </button>
              ))}
            </nav>
          </ScrollArea>

          {/* Progress Indicators */}
          <div className="pt-2 border-t text-[11px] text-muted-foreground space-y-1.5 hidden md:block">
            <div className="flex justify-between font-semibold">
              <span>Section Completion</span>
              <span>{Math.round(((activeSection + 1) / guideSections.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((activeSection + 1) / guideSections.length) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="flex-1 flex flex-col">
          <Card className="flex-1 rounded-2xl shadow-sm border overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col h-full justify-between min-h-[400px]">
              {/* Active Section Content */}
              <div className="animate-fade-in">{guideSections[activeSection].content}</div>

              {/* Navigation Controls */}
              <div className="pt-8 border-t flex justify-between items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  data-testid="guide-prev-btn"
                  onClick={handlePrevious}
                  disabled={activeSection === 0}
                  className="gap-1.5 h-10 text-xs font-semibold px-4"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="text-xs text-muted-foreground hidden sm:block font-semibold">
                  Section {activeSection + 1} of {guideSections.length}
                </div>

                <Button
                  data-testid="guide-next-btn"
                  onClick={handleNext}
                  disabled={activeSection === guideSections.length - 1}
                  className="gap-1.5 h-10 text-xs font-semibold px-4"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
