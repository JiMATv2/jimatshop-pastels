/**
 * Application Resource & Configuration File
 *
 * Centralizes default key-values for:
 * - Environment hosts (Production vs Staging)
 * - Feature flags and beta capabilities
 * - UI labels and string dictionaries
 */

export interface EnvironmentConfig {
  name: 'production' | 'staging';
  label: string;
  apiHost: string;
  supabaseUrl: string;
  anonKey: string;
  enableBetaFeatures: boolean;
}

export const DEFAULT_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJleF9zdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.EjytFJDXov2AGIo9tabwk-G1S7iP3ktL17DciczAen0";

export const ENVIRONMENTS: Record<'production' | 'staging', EnvironmentConfig> = {
  production: {
    name: 'production',
    label: 'Production',
    apiHost: (import.meta.env.VITE_EX_SUPABASE_API_URL as string | undefined) || 'https://ex_supabase.jimatbiz.com',
    supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://ex_supabase.jimatbiz.com',
    anonKey: DEFAULT_ANON_KEY,
    enableBetaFeatures: false,
  },
  staging: {
    name: 'staging',
    label: 'Staging (Beta)',
    apiHost: 'https://exsupabase.jimatlabs.com',
    supabaseUrl: 'https://exsupabase.jimatlabs.com',
    anonKey: DEFAULT_ANON_KEY,
    enableBetaFeatures: true,
  },
};

/**
 * When releasing a version to the production track without beta capabilities,
 * set this flag to false or pass VITE_ENABLE_BETA_CAPABILITIES=false.
 */
export const ENABLE_BETA_CAPABILITIES =
  import.meta.env.VITE_ENABLE_BETA_CAPABILITIES !== 'false';

/** Default PIN code to access the hidden developer / staging switcher */
export const BETA_DEV_PIN = '6886';

/** Default UI labels and string dictionary */
export const DEFAULT_LABELS = {
  app_name: 'JimatShop',
  app_tagline: 'JimatBiz Marketplace Hub',
  badge_beta: 'BETA (STAGING)',
  btn_buy_now: 'Buy Now',
  btn_add_to_cart: 'Add to Cart',
  coins_title: 'Jimat Coins',
  coins_balance: 'Available Coins',
  orders_title: 'My Orders',
  profile_title: 'Profile',
  wishlist_title: 'Wishlist',
  chat_title: 'Messages',
  search_placeholder: 'Search products, shops...',
  switch_env_title: 'Developer / Beta Environment',
  switch_env_desc: 'Select backend environment. Switching reloads the app and resets the session.',
  env_prod_label: 'Production (ex_supabase.jimatbiz.com)',
  env_staging_label: 'Staging (exsupabase.jimatlabs.com)',
  prompt_pin_label: 'Enter Beta Tester PIN',
  btn_save_restart: 'Save & Switch Host',
  btn_cancel: 'Cancel',
} as const;

export type AppLabelKey = keyof typeof DEFAULT_LABELS;
