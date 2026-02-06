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
      clientId: '552393042714-rg7dd2fimh1gpsp8bjdmg2q4bdjokf99.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
