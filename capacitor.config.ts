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
      clientId: '552393042714-oioegtu0b4rntqj2ol015jm86va9jaoj.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
