/** Public-facing Jimatshop order number derived from the UUID (e.g. JM032B5A81). */
export function formatJimatshopOrderNumber(orderId: string): string {
  return `JM${orderId.substring(0, 8).toUpperCase()}`;
}
