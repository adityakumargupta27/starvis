import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.starvis.app",
  appName: "STARVIS",
  webDir: "dist",
  server: {
    androidScheme: "https",
    // Uncomment and set your IP for live reload during development:
    // url: "http://192.168.1.35:8080",
    // cleartext: true,
  },
  android: {
    // Force dark mode to match the app theme
    backgroundColor: "#060918",
    // Allow mixed content for dev (API calls)
    allowMixedContent: true,
    // Minimum SDK version (Android 7.0+)
    minSdkVersion: 24,
  },
  ios: {
    // Content inset via Swift/Capacitor
    contentInset: "always",
    backgroundColor: "#060918",
    // Let the app render behind the notch/home indicator
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#060918",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // Makes the status bar transparent (shows app content behind it on Android)
      overlaysWebView: true,
      style: "DARK",
      backgroundColor: "#00000000",
    },
  },
};

export default config;
