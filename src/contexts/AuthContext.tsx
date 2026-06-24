import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

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
  firebaseUser: null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signIn: (user: User) => void; // legacy fallback
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// Diagnostic: log Firebase config status on load
console.info("[Auth] hasFirebaseConfig =", hasFirebaseConfig);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("starvis_jwt_token");
    const storedUser = localStorage.getItem("starvis_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("starvis_jwt_token");
        localStorage.removeItem("starvis_user");
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      let profile;
      if (hasFirebaseConfig) {
        console.info("[Auth] Starting Google sign-in with Firebase popup...");
        const { signInWithPopup } = await import("firebase/auth");
        const { auth, googleProvider } = await import("@/lib/firebase");
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          console.info("[Auth] Google sign-in successful for:", result.user.email);
          profile = {
            name: result.user.displayName || "Google Student",
            email: result.user.email || "",
            avatar: result.user.photoURL || "",
            googleId: result.user.uid
          };
        } else {
          throw new Error("No user returned from Google sign-in");
        }
      } else {
        console.warn("[Auth] hasFirebaseConfig = false — Firebase env vars missing");
        if (import.meta.env.PROD) {
          throw new Error("Google sign-in is not configured. Add Firebase environment variables in Vercel.");
        }

        // Fallback mock profile in local dev when VITE_FIREBASE_API_KEY is not defined
        profile = {
          name: "Google Student",
          email: "google.student@bmsce.in",
          avatar: "",
          googleId: "google-oauth-id-123456"
        };
      }

      const data = await api.post("/auth/google", profile);
      localStorage.setItem("starvis_jwt_token", data.token);
      const userObj = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        initials: data.initials,
        uid: data.uid,
      };
      localStorage.setItem("starvis_user", JSON.stringify(userObj));
      setUser(userObj);

      await syncLocalStorageToMongoDB();
    } catch (err: any) {
      console.error("[Auth] Google sign-in error:", err.code || "N/A", err.message);

      // Silently ignore user-cancelled popups
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        return;
      }

      // Map Firebase error codes to human-readable messages
      const errorMap: Record<string, string> = {
        "auth/operation-not-allowed": "Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.",
        "auth/unauthorized-domain": "This domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
        "auth/popup-blocked": "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.",
        "auth/network-request-failed": "Network error. Please check your internet connection and try again.",
        "auth/internal-error": "Firebase internal error. Check that Google Sign-In is enabled in Firebase Console.",
        "auth/invalid-api-key": "Invalid Firebase API key. Check your VITE_FIREBASE_API_KEY in .env.local.",
      };

      const friendlyMsg = err.code && errorMap[err.code]
        ? errorMap[err.code]
        : err.message || "Google sign-in failed. Check the browser console for details.";

      setAuthError(friendlyMsg);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("starvis_jwt_token", data.token);
      const userObj = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        initials: data.initials,
        uid: data.uid,
      };
      localStorage.setItem("starvis_user", JSON.stringify(userObj));
      setUser(userObj);

      await syncLocalStorageToMongoDB();
    } catch (err: any) {
      setAuthError(err.message || "Sign-in failed");
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setAuthError(null);
      const data = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("starvis_jwt_token", data.token);
      const userObj = {
        name: data.name,
        email: data.email,
        initials: data.initials,
        uid: data.uid,
      };
      localStorage.setItem("starvis_user", JSON.stringify(userObj));
      setUser(userObj);

      await syncLocalStorageToMongoDB();
    } catch (err: any) {
      setAuthError(err.message || "Sign-up failed");
      throw err;
    }
  };

  const signInAsGuest = async () => {
    try {
      setAuthError(null);
      const data = await api.post<{ name: string; email: string; initials: string; uid: string; token: string }>("/auth/guest", {});
      localStorage.setItem("starvis_jwt_token", data.token);
      const userObj = {
        name: data.name,
        email: data.email,
        initials: data.initials,
        uid: data.uid,
      };
      localStorage.setItem("starvis_user", JSON.stringify(userObj));
      setUser(userObj);

      await syncLocalStorageToMongoDB();
    } catch (err: any) {
      setAuthError(err.message || "Guest sign-in failed");
      throw err;
    }
  };

  // Legacy fallback (keeps existing code from crashing)
  const signIn = (u: User) => {
    setUser(u);
    localStorage.setItem("starvis_user", JSON.stringify(u));
  };

  const signOut = async () => {
    localStorage.removeItem("starvis_jwt_token");
    localStorage.removeItem("starvis_user");
    setUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  // Migration Helper: Sync existing localStorage data to MongoDB upon sign in
  const syncLocalStorageToMongoDB = async () => {
    try {
      // 1. Sync Study Profile
      const rawProfile = localStorage.getItem("starvis_study_profile");
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        await api.put("/profile", parsed);
      }

      // 2. Sync Todos
      const rawTodos = localStorage.getItem("starvis_todos");
      if (rawTodos) {
        const parsed = JSON.parse(rawTodos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const currentTodos = await api.get("/todos");
          if (currentTodos.length === 0) {
            for (const item of parsed) {
              await api.post("/todos", {
                text: item.text,
                completed: item.completed,
                priority: item.priority,
                category: item.category,
              });
            }
          }
        }
      }

      // 3. Sync Calendar Events
      const rawEvents = localStorage.getItem("starvis_calendar_events");
      if (rawEvents) {
        const parsed = JSON.parse(rawEvents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const currentEvents = await api.get("/events");
          if (currentEvents.length === 0) {
            for (const item of parsed) {
              await api.post("/events", {
                title: item.title,
                date: item.date,
                type: item.type,
                time: item.time,
                course: item.course,
              });
            }
          }
        }
      }

      // 4. Sync Assignments
      const rawAssignments = localStorage.getItem("starvis_assignments");
      if (rawAssignments) {
        const parsed = JSON.parse(rawAssignments);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const currentAssignments = await api.get("/assignments");
          if (currentAssignments.length === 0) {
            for (const item of parsed) {
              await api.post("/assignments", {
                course: item.course,
                assignment: item.assignment,
                dueDate: item.dueDate,
                status: item.status,
                priority: item.priority,
              });
            }
          }
        }
      }

      // 5. Sync Settings
      const rawSettings = localStorage.getItem("starvis_ui_settings");
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        await api.put("/settings", parsed);
      }
    } catch (error) {
      console.error("Migration/Synchronization failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        firebaseUser: null,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signIn,
        signOut,
        authError,
        clearAuthError,
      }}
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
