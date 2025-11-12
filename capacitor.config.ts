import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.za.littlelattelane.app',
  appName: 'Little Latte Lane',
  webDir: 'www',
  server: {
    url: 'https://www.littlelattelane.co.za',
    cleartext: false, // Enforce HTTPS-only (security requirement)
    androidScheme: 'https',
  },
  android: {
    // Use existing Android project structure
    path: 'android',
    // Enable deep linking
    allowMixedContent: false,
  },
  ios: {
    // Use existing iOS project structure
    path: 'ios',
  },
  plugins: {
    // Browser plugin for payment handling
    Browser: {
      toolbarColor: '#1A1A1A', // Little Latte Lane dark theme
    },
    // Push notifications configuration
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
