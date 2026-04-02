import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface User {
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signIn: (user: User) => void; // legacy fallback
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function firebaseUserToUser(fbUser: FirebaseUser): User {
  const name = fbUser.displayName || fbUser.email?.split("@")[0] || "User";
  return {
    name,
    email: fbUser.email || "",
    avatar: fbUser.photoURL || undefined,
    initials: getInitials(name),
    uid: fbUser.uid,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser(firebaseUserToUser(fbUser));
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      // User cancelled popup — don't show error
      if ((err as { code?: string }).code === "auth/popup-closed-by-user") return;
      setAuthError(msg);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setAuthError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setAuthError("Too many attempts. Please try again later.");
      } else {
        setAuthError(err instanceof Error ? err.message : "Sign-in failed");
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setAuthError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      // Name will be updated via updateProfile separately if needed
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setAuthError("Account already exists. Try signing in.");
      } else if (code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters.");
      } else {
        setAuthError(err instanceof Error ? err.message : "Sign-up failed");
      }
      throw err;
    }
  };

  // Legacy fallback (keeps existing code from crashing)
  const signIn = (u: User) => setUser(u);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, firebaseUser, signInWithGoogle, signInWithEmail, signUpWithEmail, signIn, signOut, authError, clearAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
