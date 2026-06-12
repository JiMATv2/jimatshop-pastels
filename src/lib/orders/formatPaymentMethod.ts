/** Human-readable label for jimatshop order payment_method values. */
export function formatPaymentMethodLabel(method: string | null | undefined): string {
  if (!method) return "—";

  switch (method.toLowerCase()) {
    case "billplz":
      return "Online Banking";
    case "jimatshop_coins":
    case "jimatshop_coins_platform":
    case "jimatcoins":
      return "Jimat Coins";
    case "pay_in_store":
      return "Pay in Store";
    default:
      return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
