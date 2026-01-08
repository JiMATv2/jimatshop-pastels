export type CartItem = {
  productId: string;
  name: string;
  image?: string;
  unitLabel?: string;
  unitPrice: number;
  quantity: number;
};

export type CartStateV1 = {
  version: 1;
  buyerId: string | null;
  items: CartItem[];
  updatedAt: string;
};


