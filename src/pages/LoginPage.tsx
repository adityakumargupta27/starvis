import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import SpaceBackground from "@/components/SpaceBackground";
import { Sparkles, AlertCircle, X, ArrowRight, GraduationCap } from "lucide-react";

const BMSCE_DOMAIN = "bmsce.in";

// Simulated Google accounts for the picker (demo mode)
// In production, replace with real Firebase Google OAuth
const DEMO_ACCOUNTS = [
  {
    name: "Aditya Kumar Gupta",
    email: "1by22cs027@bmsce.in",
    avatar: "https://ui-avatars.com/api/?name=Aditya+Kumar&background=7c3aed&color=fff&size=96",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface GooglePickerProps {
  onSelect: (acc: { name: string; email: string; avatar?: string }) => void;
  onClose: () => void;
  onCustomEmail: () => void;
}

function GoogleAccountPicker({ onSelect, onClose, onCustomEmail }: GooglePickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#1c1f2e] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* Google G logo SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white text-sm font-medium">Choose an account</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-3">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              onClick={() => onSelect(acc)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-all duration-200 text-left group"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <img
                src={acc.avatar}
                alt={acc.name}
                className="w-10 h-10 rounded-full border border-white/10"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{acc.name}</p>
                <p className="text-xs text-gray-400 truncate">{acc.email}</p>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
            </button>
          ))}

          <button
            onClick={onCustomEmail}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-all duration-200 text-left mt-1 border-t border-white/10 pt-3"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300 text-xs">+</span>
            </div>
            <div>
              <p className="text-sm text-white">Use another account</p>
              <p className="text-xs text-gray-500">Must be a @bmsce.in address</p>
            </div>
          </button>
        </div>

        <div className="px-5 pb-4">
          <p className="text-[10px] text-gray-600 text-center">
            Only <span className="text-gray-400">@bmsce.in</span> college accounts are permitted
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface CustomEmailFormProps {
  onBack: () => void;
  onSignIn: (name: string, email: string) => void;
}

function CustomEmailForm({ onBack, onSignIn }: CustomEmailFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith(`@${BMSCE_DOMAIN}`)) {
      setError(`Only @${BMSCE_DOMAIN} college email addresses are allowed.`);
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    onSignIn(name.trim(), trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#1c1f2e] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="px-5 pt-5 pb-3 border-b border-white/10 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-white p-1 transition-colors">
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white text-sm font-medium">Sign in with Google</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Aditya Kumar"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">BMSCE Email</label>
            <input
              type="email"
              placeholder="usn@bmsce.in"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={14} />
          </button>

          <p className="text-[10px] text-center text-gray-600">
            Only BMS College of Engineering (@bmsce.in) student and faculty accounts are allowed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleAccountSelect = (acc: { name: string; email: string; avatar?: string }) => {
    if (!acc.email.endsWith(`@${BMSCE_DOMAIN}`)) {
      setShowPicker(false);
      setErrorMsg(`Only @${BMSCE_DOMAIN} accounts are allowed. "${acc.email}" is not permitted.`);
      return;
    }
    setIsSigningIn(true);
    setShowPicker(false);
    setTimeout(() => {
      signIn({
        name: acc.name,
        email: acc.email,
        avatar: acc.avatar,
        initials: getInitials(acc.name),
      });
      setIsSigningIn(false);
    }, 1200);
  };

  const handleCustomSignIn = (name: string, email: string) => {
    setIsSigningIn(true);
    setShowCustomForm(false);
    setTimeout(() => {
      signIn({
        name,
        email,
        initials: getInitials(name),
      });
      setIsSigningIn(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <SpaceBackground />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        {/* Logo + branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-900/50"
          >
            <Sparkles size={36} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            STARVIS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-gray-400 text-sm mt-1"
          >
            Your AI-powered study companion
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: "rgba(10,14,35,0.7)", backdropFilter: "blur(24px)" }}
        >
          <div className="p-6 space-y-5">
            {/* College badge */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-600/10 border border-purple-500/20">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={16} className="text-purple-300" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">BMS College of Engineering</p>
                <p className="text-gray-500 text-[10px]">Restricted to @bmsce.in accounts only</p>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Welcome back 👋</h2>
              <p className="text-gray-400 text-xs">
                Sign in with your BMSCE Google account to continue.
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setErrorMsg(""); setShowPicker(true); }}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all duration-200 shadow-lg disabled:opacity-60"
            >
              {isSigningIn ? (
                <motion.div
                  className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isSigningIn ? "Signing you in..." : "Continue with Google"}
            </motion.button>

            <p className="text-[10px] text-gray-600 text-center leading-relaxed">
              By continuing, you agree to STARVIS terms. <br />
              Non-BMSCE accounts will be rejected.
            </p>
          </div>
        </motion.div>

        {/* Version */}
        <p className="text-center text-gray-700 text-[10px] mt-5">
          STARVIS v1.0 · Ionic Capacitor · React
        </p>
      </motion.div>

      {/* Google Account Picker */}
      <AnimatePresence>
        {showPicker && !showCustomForm && (
          <GoogleAccountPicker
            onSelect={handleAccountSelect}
            onClose={() => setShowPicker(false)}
            onCustomEmail={() => { setShowPicker(false); setShowCustomForm(true); }}
          />
        )}
      </AnimatePresence>

      {/* Custom Email Form */}
      <AnimatePresence>
        {showCustomForm && (
          <CustomEmailForm
            onBack={() => { setShowCustomForm(false); setShowPicker(true); }}
            onSignIn={handleCustomSignIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
