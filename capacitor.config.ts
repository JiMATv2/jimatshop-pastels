import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jimatbiz.shop3',
  appName: 'jimatshop-pastels',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
