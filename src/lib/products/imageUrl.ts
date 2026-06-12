type ProductImageFields = {
  jimatshop_image_url?: string | null;
  /** Fallback when ex_supabase/pg truncates long nested column aliases. */
  jimatshop_imag?: string | null;
  cover_image_url?: string | null;
  cover_image_ur?: string | null;
  image_url?: string | null;
};

/** Prefer Jimatshop image, matching ex_supabase mobile API coalesce order. */
export function resolveProductImageUrl(product: ProductImageFields | null | undefined): string | null {
  if (!product) return null;

  return (
    product.jimatshop_image_url ||
    product.jimatshop_imag ||
    product.cover_image_url ||
    product.cover_image_ur ||
    product.image_url ||
    null
  );
}
