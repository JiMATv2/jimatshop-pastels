import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jimatbiz.shop3',
  appName: 'jimatshop-pastels',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Web OAuth client ID – used as the id_token audience verified by the
      // ex_supabase backend at /supabase/auth/google.
      clientId: '552393042714-oioegtu0b4rntqj2ol015jm86va9jaoj.apps.googleusercontent.com',
      serverClientId: '552393042714-oioegtu0b4rntqj2ol015jm86va9jaoj.apps.googleusercontent.com',
      iosClientId: '552393042714-cjtit54f5qogspi1q6544gh7m2s8t9lk.apps.googleusercontent.com',
      // Android uses this platform-specific OAuth client (requires SHA-1
      // fingerprint registered in Google Cloud Console).
      androidClientId: '552393042714-0ju9rcu6ov6v09s9rml6g4mjrg30asf8.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
