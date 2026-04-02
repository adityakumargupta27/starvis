import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SpaceBackground from "@/components/SpaceBackground";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  Bell,
  Palette,
  Shield,
  BookOpen,
  Target,
  Sparkles,
  Save,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAILY_GOAL_OPTIONS = [2, 4, 6, 8, 10];

type AccentColor = "purple" | "blue" | "green" | "orange" | "pink";

const ACCENT_COLORS: { name: AccentColor; class: string; bg: string }[] = [
  { name: "purple", class: "bg-purple-500", bg: "bg-purple-500/20 border-purple-500/40" },
  { name: "blue", class: "bg-blue-500", bg: "bg-blue-500/20 border-blue-500/40" },
  { name: "green", class: "bg-green-500", bg: "bg-green-500/20 border-green-500/40" },
  { name: "orange", class: "bg-orange-500", bg: "bg-orange-500/20 border-orange-500/40" },
  { name: "pink", class: "bg-pink-500", bg: "bg-pink-500/20 border-pink-500/40" },
];

interface SettingsState {
  name: string;
  email: string;
  course: string;
  year: string;
  dailyGoal: number;
  accent: AccentColor;
  notifications: boolean;
  studyReminders: boolean;
  assignmentAlerts: boolean;
  soundEffects: boolean;
  haptics: boolean;
  darkMode: boolean;
  aiPersonality: "friendly" | "professional" | "motivating";
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Profile: <Sparkles size={16} />,
  "Study Goals": <Target size={16} />,
  Appearance: <Palette size={16} />,
  Notifications: <Bell size={16} />,
  "AI Assistant": <Sparkles size={16} />,
  Privacy: <Shield size={16} />,
};

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <span className="text-purple-400">{SECTION_ICONS[title]}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ToggleRow({ label, description, value, onChange }: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<SettingsState>({
    name: user?.name || "Student",
    email: user?.email || "",
    course: "B.Tech Computer Science",
    year: "2nd Year",
    dailyGoal: 4,
    accent: "purple",
    notifications: true,
    studyReminders: true,
    assignmentAlerts: true,
    soundEffects: false,
    haptics: true,
    darkMode: true,
    aiPersonality: "friendly",
  });

  const set = <K extends keyof SettingsState>(key: K, val: SettingsState[K]) =>
    setSettings(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    toast({
      title: "Settings saved! ✅",
      description: "Your preferences have been updated.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "See you next time! 👋" });
  };

  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen pb-24">
      <SpaceBackground />
      <div className="relative z-10 max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
              <Settings className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-sm text-gray-400">Customize your STARVIS experience</p>
            </div>
          </div>
        </motion.div>

        {/* Profile */}
        <SettingsSection title="Profile">
          <div className="flex items-center gap-4 mb-2">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full border-2 border-purple-500/40" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.initials || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                ✓ BMSCE Verified
              </span>
            </div>
          </div>
          <Separator className="bg-white/10 my-3" />
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Display Name</Label>
              <Input
                value={settings.name}
                onChange={e => set("name", e.target.value)}
                className="bg-white/5 border-purple-400/30 text-white h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Course</Label>
                <Input
                  value={settings.course}
                  onChange={e => set("course", e.target.value)}
                  className="bg-white/5 border-purple-400/30 text-white h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Year</Label>
                <Input
                  value={settings.year}
                  onChange={e => set("year", e.target.value)}
                  className="bg-white/5 border-purple-400/30 text-white h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Study Goals */}
        <SettingsSection title="Study Goals">
          <div>
            <p className="text-sm text-white mb-2">Daily Study Goal</p>
            <div className="flex gap-2 flex-wrap">
              {DAILY_GOAL_OPTIONS.map(h => (
                <button
                  key={h}
                  onClick={() => set("dailyGoal", h)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    settings.dailyGoal === h
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Currently targeting <span className="text-purple-300">{settings.dailyGoal} hours/day</span>
            </p>
          </div>
          <Separator className="bg-white/10" />
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-600/10 border border-purple-500/20">
            <BookOpen size={16} className="text-purple-300" />
            <div>
              <p className="text-sm text-white">Weekly target</p>
              <p className="text-xs text-gray-400">{settings.dailyGoal * 7} hours · {settings.dailyGoal * 30} hours/month</p>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <ToggleRow
            label="Dark Mode"
            description="Space theme is always active"
            value={settings.darkMode}
            onChange={v => set("darkMode", v)}
          />
          <Separator className="bg-white/10" />
          <div>
            <p className="text-sm text-white mb-3">Accent Color</p>
            <div className="flex gap-3">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => set("accent", c.name)}
                  className={`w-8 h-8 rounded-full ${c.class} transition-transform hover:scale-110 ${
                    settings.accent === c.name ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : ""
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 capitalize">Selected: {settings.accent}</p>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <ToggleRow label="Push Notifications" description="Receive alerts on your device" value={settings.notifications} onChange={v => set("notifications", v)} />
          <Separator className="bg-white/10" />
          <ToggleRow label="Study Reminders" description="Daily reminders to hit your goal" value={settings.studyReminders} onChange={v => set("studyReminders", v)} />
          <ToggleRow label="Assignment Alerts" description="Alerts when deadlines are near" value={settings.assignmentAlerts} onChange={v => set("assignmentAlerts", v)} />
          <Separator className="bg-white/10" />
          <ToggleRow label="Sound Effects" value={settings.soundEffects} onChange={v => set("soundEffects", v)} />
          <ToggleRow label="Haptic Feedback" description="Vibration on interactions" value={settings.haptics} onChange={v => set("haptics", v)} />
        </SettingsSection>

        {/* AI Assistant */}
        <SettingsSection title="AI Assistant">
          <p className="text-sm text-white mb-2">STARVIS AI Personality</p>
          <div className="space-y-2">
            {(["friendly", "professional", "motivating"] as const).map(p => (
              <button
                key={p}
                onClick={() => set("aiPersonality", p)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                  settings.aiPersonality === p
                    ? "bg-purple-600/20 border-purple-500/50"
                    : "bg-white/3 border-white/10 hover:border-purple-400/30"
                }`}
                style={{ background: settings.aiPersonality === p ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)" }}
              >
                <div>
                  <p className="text-sm font-medium text-white capitalize">{p}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p === "friendly" ? "Warm and casual, like a study buddy" :
                     p === "professional" ? "Formal and structured, like a tutor" :
                     "Energetic and encouraging coach"}
                  </p>
                </div>
                {settings.aiPersonality === p && (
                  <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/30 text-xs">Active</Badge>
                )}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* App Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-black/10 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="pt-4 pb-4 px-5 space-y-2">
              {[
                ["Version", "1.0.0 (Build 1)"],
                ["Framework", "Ionic Capacitor + React"],
                ["AI Model", "Google Gemini 1.5 Flash"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-gray-300">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Save button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white h-12 rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/30"
          >
            <Save size={16} className="mr-2" />
            Save Settings
          </Button>
        </motion.div>
        {/* Sign Out */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full h-11 rounded-xl text-sm font-semibold border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
