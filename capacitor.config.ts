import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nour.ai',
  appName: 'Nour AI',
  webDir: 'dist/public',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    allowNavigation: ['localhost'],
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
