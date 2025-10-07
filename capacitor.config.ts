import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.littlelattelane.app',
  appName: 'Little Latte Lane',
  webDir: 'public',
  server: {
    url: 'https://www.littlelattelane.co.za',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0D0D0D',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Little Latte Lane'
  }
};

export default config;
