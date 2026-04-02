import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import SpaceBackground from "@/components/SpaceBackground";
import { AlertCircle, Eye, EyeOff, Sparkles, ArrowRight, Mail, Lock, User, ChevronLeft } from "lucide-react";

/* ─── Animated star field specific to login ─────────────────────────── */
function FloatingOrbs() {
  return (
    <>
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
    </>
  );
}

/* ─── Animated Google G Logo ─────────────────────────────────────────── */
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <motion.div
      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
    />
  );
}

/* ─── Input Field ────────────────────────────────────────────────────── */
function InputField({
  id, type, placeholder, value, onChange, icon: Icon, rightEl, autoFocus, onKeyDown,
}: {
  id: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void;
  icon: React.ElementType; rightEl?: React.ReactNode;
  autoFocus?: boolean; onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative flex items-center rounded-xl border transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: focused ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.1)",
        boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
      }}
    >
      <Icon size={16} className="absolute left-3.5 text-gray-500 pointer-events-none" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-white placeholder:text-gray-600 outline-none"
      />
      {rightEl && <div className="absolute right-3">{rightEl}</div>}
    </div>
  );
}

/* ─── Error Banner ───────────────────────────────────────────────────── */
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      className="flex items-start gap-2.5 p-3 rounded-xl"
      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
    >
      <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-red-300 leading-relaxed">{msg}</p>
    </motion.div>
  );
}

type View = "main" | "email-signin" | "email-signup";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, authError, clearAuthError } = useAuth();
  const [view, setView] = useState<View>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const error = localError || authError || "";

  // animated text cycling
  const taglines = ["Your AI-powered study companion", "Smarter notes, better grades", "Study less. Learn more."];
  const [tagIdx, setTagIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTagIdx((i) => (i + 1) % taglines.length), 3000);
    return () => clearInterval(t);
  }, []);

  const clearErrors = () => { setLocalError(""); clearAuthError(); };
  const goBack = () => { setView("main"); clearErrors(); setEmail(""); setPassword(""); setName(""); };

  const handleGoogleSignIn = async () => {
    clearErrors();
    setLoading(true);
    try { await signInWithGoogle(); } catch { /* handled in context */ }
    finally { setLoading(false); }
  };

  const handleEmailSignIn = async () => {
    clearErrors();
    if (!email.trim()) { setLocalError("Please enter your email."); return; }
    if (!password) { setLocalError("Please enter your password."); return; }
    setLoading(true);
    try { await signInWithEmail(email.trim(), password); }
    catch { /* error set in context */ }
    finally { setLoading(false); }
  };

  const handleEmailSignUp = async () => {
    clearErrors();
    if (!name.trim()) { setLocalError("Please enter your name."); return; }
    if (!email.trim()) { setLocalError("Please enter your email."); return; }
    if (password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try { await signUpWithEmail(email.trim(), password, name.trim()); }
    catch { /* error set in context */ }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #01020f 0%, #080b1f 50%, #0d0a1e 100%)" }}>
      <SpaceBackground />
      <FloatingOrbs />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[380px] px-4"
      >
        {/* ── LOGO ── */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
            className="w-[72px] h-[72px] rounded-[22px] mx-auto mb-4 flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9, #4f46e5)",
              boxShadow: "0 20px 60px rgba(124,58,237,0.45), 0 0 0 1px rgba(139,92,246,0.3)",
            }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-[22px]" style={{ background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent 60%)" }} />
            <Sparkles size={32} className="text-white relative z-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-[32px] font-black tracking-widest text-white"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.15em" }}
          >
            STARVIS
          </motion.h1>

          {/* Animated tagline */}
          <div className="h-5 mt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={tagIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-gray-500"
              >
                {taglines[tagIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ── CARD ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,12,28,0.75)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.05) inset",
          }}
        >
          <AnimatePresence mode="wait">

            {/* ────── MAIN VIEW ────── */}
            {view === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-4"
              >
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-white">Welcome back 👋</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Sign in to continue to STARVIS</p>
                </div>

                {/* Google Button — primary CTA */}
                <motion.button
                  id="google-signin-btn"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: "white",
                    color: "#1a1a2e",
                    boxShadow: "0 4px 24px rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Shimmer on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    whileHover={{ translateX: "200%" }}
                    transition={{ duration: 0.6 }}
                  />
                  {loading ? <Spinner /> : <><GoogleIcon size={18} /><span>Continue with Google</span></>}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Email Sign In */}
                <motion.button
                  id="email-signin-btn"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => { clearErrors(); setView("email-signin"); }}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium text-gray-200 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Mail size={16} className="text-purple-400" />
                  Sign in with Email
                  <ArrowRight size={14} className="ml-auto text-gray-600" />
                </motion.button>

                {/* Sign up link */}
                <p className="text-center text-xs text-gray-600">
                  Don't have an account?{" "}
                  <button
                    id="goto-signup-btn"
                    onClick={() => { clearErrors(); setView("email-signup"); }}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Create one
                  </button>
                </p>

                {/* Trust badges */}
                <div className="pt-1 flex items-center justify-center gap-4">
                  {["Secure", "Private", "Fast"].map((badge) => (
                    <span key={badge} className="flex items-center gap-1 text-[10px] text-gray-700">
                      <span className="w-1 h-1 rounded-full bg-emerald-500/60 inline-block" />
                      {badge}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ────── EMAIL SIGN IN VIEW ────── */}
            {view === "email-signin" && (
              <motion.div
                key="email-signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-4"
              >
                {/* Sub-header */}
                <div className="flex items-center gap-2">
                  <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Sign in</h2>
                    <p className="text-[11px] text-gray-500">Use your STARVIS account</p>
                  </div>
                </div>

                <InputField
                  id="signin-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(v) => { setEmail(v); clearErrors(); }}
                  icon={Mail}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                />

                <InputField
                  id="signin-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(v) => { setPassword(v); clearErrors(); }}
                  icon={Lock}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                  rightEl={
                    <button onClick={() => setShowPass(!showPass)} className="text-gray-600 hover:text-gray-300 transition-colors p-0.5">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                <AnimatePresence>{error && <ErrorBanner msg={error} />}</AnimatePresence>

                <motion.button
                  id="submit-signin-btn"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={handleEmailSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}
                >
                  {loading ? <Spinner /> : <><span>Sign in</span><ArrowRight size={14} /></>}
                </motion.button>

                <p className="text-center text-xs text-gray-600">
                  Need an account?{" "}
                  <button onClick={() => { clearErrors(); setView("email-signup"); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Sign up
                  </button>
                </p>
              </motion.div>
            )}

            {/* ────── EMAIL SIGN UP VIEW ────── */}
            {view === "email-signup" && (
              <motion.div
                key="email-signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Create account</h2>
                    <p className="text-[11px] text-gray-500">Join STARVIS for free</p>
                  </div>
                </div>

                <InputField
                  id="signup-name"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(v) => { setName(v); clearErrors(); }}
                  icon={User}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignUp()}
                />

                <InputField
                  id="signup-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(v) => { setEmail(v); clearErrors(); }}
                  icon={Mail}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignUp()}
                />

                <InputField
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password (min. 6 chars)"
                  value={password}
                  onChange={(v) => { setPassword(v); clearErrors(); }}
                  icon={Lock}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignUp()}
                  rightEl={
                    <button onClick={() => setShowPass(!showPass)} className="text-gray-600 hover:text-gray-300 transition-colors p-0.5">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                <AnimatePresence>{error && <ErrorBanner msg={error} />}</AnimatePresence>

                <motion.button
                  id="submit-signup-btn"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={handleEmailSignUp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}
                >
                  {loading ? <Spinner /> : <><span>Create account</span><ArrowRight size={14} /></>}
                </motion.button>

                <p className="text-center text-xs text-gray-600">
                  Already have one?{" "}
                  <button onClick={() => { clearErrors(); setView("email-signin"); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-700 mt-5 tracking-wider">
          STARVIS v1.0 · Secured by Firebase
        </p>
      </motion.div>
    </div>
  );
}
