import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Diagnostic: confirm Firebase init
console.info(`[Firebase] Initialized for project: ${firebaseConfig.projectId || "MISSING"}`);

export const auth = getAuth(app);

// Use localStorage persistence to avoid sessionStorage issues in
// Capacitor/WebView environments (fixes "missing initial state" error)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("[Firebase] Could not set persistence:", err.message);
});

export const googleProvider = new GoogleAuthProvider();
// Request email and profile scopes explicitly
googleProvider.addScope("email");
googleProvider.addScope("profile");

export default app;
