import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Check, Zap, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SpaceBackground from "@/components/SpaceBackground";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionDetails {
  plan: string;
  expiresAt: string | null;
  limits: {
    aiRequestsPerDay: number;
    notesMax: number;
    documentsMax: number;
    flashcardDecksMax: number;
    quizzesPerDay: number;
  };
  features: string[];
  usage: {
    notes: number;
    documents: number;
    flashcardDecks: number;
    quizzes: number;
  };
}

const PLAN_INFO = {
  free: {
    badge: "Basic",
    description: "Core features for single students",
    popular: false,
    gradient: "from-gray-800 to-slate-900",
    border: "border-slate-800",
  },
  pro: {
    badge: "Most Popular",
    description: "Advanced AI tools and higher limits",
    popular: true,
    gradient: "from-purple-950/40 via-violet-900/30 to-slate-950/50",
    border: "border-purple-500/40",
  },
  premium: {
    badge: "Unlimited",
    description: "Full power academic copilot sandbox",
    popular: false,
    gradient: "from-indigo-950/40 via-blue-900/30 to-slate-950/50",
    border: "border-indigo-500/40",
  },
};

export default function BillingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sub, setSub] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const data = await api.get<SubscriptionDetails>("/billing/subscription");
      setSub(data);
    } catch (err: any) {
      toast({
        title: "Error fetching subscription",
        description: err.message || "Could not retrieve billing details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (sub?.plan === planId) return;
    
    setActionLoading(planId);
    try {
      const data = await api.post<{ plan: string; message: string }>("/billing/upgrade", { plan: planId });
      toast({
        title: "Plan updated! 🎉",
        description: data.message,
      });
      // Refresh details
      await fetchSubscription();
    } catch (err: any) {
      toast({
        title: "Upgrade failed",
        description: err.message || "Mock upgrade encountered an error.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
        <SpaceBackground />
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin relative z-10" />
        <p className="text-gray-400 text-sm mt-3 relative z-10">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen pb-24 text-white">
      <SpaceBackground />
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
              <Zap className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Subscription & Billing</h1>
              <p className="text-sm text-gray-400">Manage plan quotas, usage limits, and sandbox upgrades</p>
            </div>
          </div>
        </motion.div>

        {/* Current Plan Overview Card */}
        {sub && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-purple-500/20 text-white">
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      Current Plan: 
                      <span className="text-purple-400 uppercase tracking-widest text-lg font-black ml-1">
                        {sub.plan}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {sub.expiresAt 
                        ? `Renews/Expires on ${new Date(sub.expiresAt).toLocaleDateString()}` 
                        : "Permanent lifetime demo allocation"}
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-600 text-white uppercase text-xs w-fit py-1 px-3 self-start sm:self-center">
                    Mock Billing Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="px-5 pb-5 pt-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Quotas & Usage Meters */}
                  {[
                    { label: "Notes Saved", used: sub.usage.notes, max: sub.limits.notesMax },
                    { label: "Document Uploads", used: sub.usage.documents, max: sub.limits.documentsMax },
                    { label: "Flashcard Decks", used: sub.usage.flashcardDecks, max: sub.limits.flashcardDecksMax },
                    { label: "Quiz Generations", used: sub.usage.quizzes, max: sub.limits.quizzesPerDay, labelSuffix: "/day" },
                  ].map((meter) => {
                    const pct = meter.max === -1 ? 0 : Math.min(100, (meter.used / meter.max) * 100);
                    return (
                      <div key={meter.label} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-xs text-gray-400 block font-medium">{meter.label}</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xl font-bold text-white">{meter.used}</span>
                          <span className="text-xs text-gray-500">
                            of {meter.max === -1 ? "∞" : meter.max}{meter.labelSuffix}
                          </span>
                        </div>
                        {meter.max !== -1 && (
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex"
          >
            <Card className="flex flex-col flex-1 bg-black/40 backdrop-blur-md border-white/10 text-white justify-between overflow-hidden relative">
              <CardHeader className="pb-4">
                <Badge variant="outline" className="w-fit text-[10px] text-gray-400 border-gray-600 mb-2 uppercase">
                  {PLAN_INFO.free.badge}
                </Badge>
                <CardTitle className="text-xl font-bold">Free Plan</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black">₹0</span>
                  <span className="text-xs text-gray-500">/ forever</span>
                </div>
                <CardDescription className="text-gray-400 text-xs mt-1">
                  {PLAN_INFO.free.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3 pb-6 flex-grow">
                {[
                  "10 AI requests / day",
                  "Max 20 study notes",
                  "3 PDF document uploads",
                  "5 Flashcard decks",
                  "3 Quizzes / day",
                  "Pomodoro Session tracking",
                ].map((f) => (
                  <div key={f} className="flex gap-2.5 items-start text-xs text-gray-300">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-2 pb-4">
                <Button
                  onClick={() => handleUpgrade("free")}
                  disabled={sub?.plan === "free" || actionLoading !== null}
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-white/5 text-white rounded-xl h-10 text-xs font-semibold"
                >
                  {actionLoading === "free" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : sub?.plan === "free" ? (
                    "Active Plan"
                  ) : (
                    "Downgrade to Free"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex"
          >
            <Card className="flex flex-col flex-1 bg-gradient-to-b from-purple-950/20 via-slate-950/40 to-slate-950/50 backdrop-blur-md border-purple-500/40 text-white justify-between overflow-hidden relative shadow-lg shadow-purple-950/20">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-extrabold uppercase py-1 px-3.5 rounded-bl-xl tracking-wider">
                {PLAN_INFO.pro.badge}
              </div>
              <CardHeader className="pb-4">
                <Badge variant="outline" className="w-fit text-[10px] text-purple-300 border-purple-500/30 mb-2 uppercase">
                  SaaS Core
                </Badge>
                <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                  Pro Plan <Sparkles size={16} className="text-purple-400" />
                </CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black">₹299</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <CardDescription className="text-gray-400 text-xs mt-1">
                  {PLAN_INFO.pro.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3 pb-6 flex-grow">
                {[
                  "100 AI requests / day",
                  "500 study notes",
                  "50 PDF uploads + Document RAG Chat",
                  "100 Flashcard decks",
                  "30 Quizzes / day",
                  "Adaptive AI Study Planner",
                  "Focus Analytics dashboards",
                ].map((f) => (
                  <div key={f} className="flex gap-2.5 items-start text-xs text-gray-300">
                    <Check size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-2 pb-4">
                <Button
                  onClick={() => handleUpgrade("pro")}
                  disabled={sub?.plan === "pro" || actionLoading !== null}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 text-xs font-semibold shadow-md shadow-purple-950/20"
                >
                  {actionLoading === "pro" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : sub?.plan === "pro" ? (
                    "Active Plan"
                  ) : (
                    "Upgrade to Pro"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex"
          >
            <Card className="flex flex-col flex-1 bg-gradient-to-b from-indigo-950/20 via-slate-950/40 to-slate-950/50 backdrop-blur-md border-indigo-500/40 text-white justify-between overflow-hidden relative shadow-lg shadow-indigo-950/20">
              <CardHeader className="pb-4">
                <Badge variant="outline" className="w-fit text-[10px] text-indigo-300 border-indigo-500/30 mb-2 uppercase">
                  {PLAN_INFO.premium.badge}
                </Badge>
                <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                  Premium Plan <Zap size={16} className="text-indigo-400" />
                </CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black">₹599</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <CardDescription className="text-gray-400 text-xs mt-1">
                  {PLAN_INFO.premium.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3 pb-6 flex-grow">
                {[
                  "Unlimited AI chatbot requests",
                  "Unlimited study notes",
                  "Unlimited PDF uploads",
                  "Unlimited Flashcard decks",
                  "Unlimited Quizzes",
                  "AI Exam Predictions & Career roadmap",
                  "AI Resume Builder tool",
                  "All future premium releases included",
                ].map((f) => (
                  <div key={f} className="flex gap-2.5 items-start text-xs text-gray-300">
                    <Check size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-2 pb-4">
                <Button
                  onClick={() => handleUpgrade("premium")}
                  disabled={sub?.plan === "premium" || actionLoading !== null}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 text-xs font-semibold shadow-md shadow-indigo-950/20"
                >
                  {actionLoading === "premium" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : sub?.plan === "premium" ? (
                    "Active Plan"
                  ) : (
                    "Upgrade to Premium"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Payment gateways notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 max-w-lg mx-auto"
        >
          <AlertCircle size={18} className="text-purple-300 flex-shrink-0" />
          <p className="text-xs text-purple-200 leading-normal">
            <strong>Mock Gateway Sandbox Enabled:</strong> Upgrades and downgrades occur instantly without actual charge. Razorpay and Stripe endpoints are integration-ready for production activation.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
