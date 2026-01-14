export type CartItem = {
  productId: string;
  name: string;
  image?: string;
  unitLabel?: string;
  unitPrice: number;
  quantity: number;
  // Buyer/retailer information - required to ensure correct order processing
  buyerId?: string;
  buyerInventoryId?: string;
};

export type CartStateV1 = {
  version: 1;
  buyerId: string | null;
  items: CartItem[];
  updatedAt: string;
};


