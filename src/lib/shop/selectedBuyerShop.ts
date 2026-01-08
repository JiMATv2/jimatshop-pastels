import * as React from "react";

const KEY = "jimatshop_selected_buyer_shop_id";

export function getSelectedBuyerShopId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setSelectedBuyerShopId(id: string | null) {
  try {
    if (!id) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, id);
    // Same-tab notification (storage events only fire across tabs).
    window.dispatchEvent(
      new CustomEvent("jimatshop:selectedBuyerShopChanged", { detail: { buyerId: id } }),
    );
  } catch {
    // ignore
  }
}

export function useSelectedBuyerShop() {
  const [buyerId, setBuyerId] = React.useState<string | null>(() => getSelectedBuyerShopId());

  const setSelected = React.useCallback((id: string | null) => {
    setSelectedBuyerShopId(id);
    setBuyerId(id);
  }, []);

  return { buyerId, setBuyerId: setSelected };
}


