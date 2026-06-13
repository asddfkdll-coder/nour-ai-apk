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
};
export default config;
