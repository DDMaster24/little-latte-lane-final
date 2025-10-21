import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.za.littlelattelane.app',
  appName: 'Little Latte Lane',
  webDir: 'public', // Use public folder with index redirect
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#0D0D0D',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#00D9FF'
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    },
    // Allow external URL loading
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Little Latte Lane'
  }
};

export default config;
