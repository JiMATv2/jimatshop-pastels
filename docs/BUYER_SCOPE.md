# JimatShop-Pastels - Mobile Buyer Scope

## 1. Mermaid JS Diagram: Buyer Journey

```mermaid
graph TD
    %% Entry Point
    Login[Login / Auth] --> Home[Home / Discovery]

    %% Discovery Phase
    Home --> Campaigns[Campaigns / Flash Sales]
    Home --> Search[Product Search / Semantic]
    Home --> Categories[Browse Categories]
    Home --> Shops[Browse Nearby Shops]

    %% Product Interaction
    Campaigns --> ProdDet[Product Details]
    Search --> ProdDet
    Categories --> ProdDet
    Shops --> ProdDet

    %% Transaction Phase
    ProdDet --> Cart[Add to Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Payment[Payment Integration / Billplz]

    %% Order Management
    Payment --> OrderSuccess[Order Success]
    OrderSuccess --> Orders[My Orders List]
    Orders --> OrderDet[Order Details]

    %% Post-Purchase / Financials
    OrderDet --> PayPending[Pay Pending Invoices]
    OrderDet --> RefundReq[Request Refund]
    RefundReq --> RefundStatus[Track Refund Status]
    OrderDet --> TrackShip[Track Shipping / Delivery]

    %% Loyalty
    OrderSuccess --> Coins[Earn JimatShop Coins]
    Home --> CoinsBalance[Check Coins & Transactions]

    style Login fill:#f9f,stroke:#333,stroke-width:2px
    style Checkout fill:#bbf,stroke:#333,stroke-width:2px
    style RefundReq fill:#faa,stroke:#333,stroke-width:2px
```

## 2. Buyer Product Feature Reference

| Module | Business Context | Core Functions | Reference Pages |
| :--- | :--- | :--- | :--- |
| **Product Discovery** | B2C consumer browsing and AI-powered product search. | Semantic Search, Category Browsing, Nearby Shop Map, Campaigns. | `src/pages/Index.tsx`, `src/pages/Products.tsx`, `src/pages/Shops.tsx` |
| **Loyalty (Coins)** | Incentivizing repeat purchases through a digital currency system. | Coin Earning, Coin Redemption at Checkout, Transaction History. | `src/pages/JimatshopCoins.tsx`, `src/pages/JimatshopCoinTransactions.tsx` |
| **Promotion Management** | High-visibility marketing campaigns for consumers. | Flash Sales, Banner Placement, Campaign-specific Landing Pages. | `src/pages/Campaigns.tsx`, `src/pages/CampaignDetails.tsx` |
| **Checkout & Logistics** | Consumer-friendly purchasing with location-aware delivery. | Real-time Location Search, Cart Management, Address Selection. | `src/pages/Checkout.tsx`, `src/pages/LocationSearch.tsx` |
| **Payment Tracking** | Seamless payment confirmation for consumer orders. | Billplz Integration, Real-time Payment Status Updates. | `src/pages/OrderDetails.tsx`, `src/pages/OrderHistory.tsx` |
| **Refund Request** | Consumer-facing dispute resolution for order issues. | Image Evidence Upload, Refund Status Tracking, Request Submission. | `src/pages/RefundRequest.tsx`, `src/pages/RefundDetails.tsx` |
| **Shipping & Tracking** | End-to-end delivery visibility for the consumer. | Live Delivery Status, Driver Tracking, Shipment Updates. | `jimatshop_deliveries` (Table), `src/pages/OrderDetails.tsx` |
| **Storefronts** | Multi-vendor localized shopping experience. | Shop Profiles, Vendor-specific Product Listings, Nearby Shops. | `src/pages/Shops.tsx`, `src/pages/ProductDetails.tsx` |
