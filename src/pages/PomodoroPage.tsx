import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer, Play, Pause, RotateCcw, CheckCircle, Coffee, Zap,
  BarChart2, Clock, Flame, Target, BookOpen, X, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Session { _id: string; mode: string; plannedDuration: number; actualDuration: number; completed: boolean; subject: string; startedAt: string; }
interface Stats { totalMinutes: number; totalSessions: number; byDay: Record<string, number>; }

type Mode = "focus" | "shortBreak" | "longBreak";
const MODES: Record<Mode, { label: string; duration: number; color: string; bg: string; icon: React.ReactNode }> = {
  focus: { label: "Focus", duration: 25, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", icon: <Zap size={16} /> },
  shortBreak: { label: "Short Break", duration: 5, color: "#34d399", bg: "rgba(52,211,153,0.15)", icon: <Coffee size={16} /> },
  longBreak: { label: "Long Break", duration: 15, color: "#60a5fa", bg: "rgba(96,165,250,0.15)", icon: <Timer size={16} /> },
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CircularTimer({ progress, mode, time }: { progress: number; mode: Mode; time: number }) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  const color = MODES[mode].color;

  return (
    <div className="relative inline-flex items-center justify-center w-56 h-56">
      <svg className="absolute inset-0 -rotate-90" width="224" height="224">
        <circle cx="112" cy="112" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="112" cy="112" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s linear", filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="text-center z-10">
        <div className="text-5xl font-bold text-white tabular-nums">{formatTime(time)}</div>
        <div className="text-sm mt-1" style={{ color }}>{MODES[mode].label}</div>
      </div>
    </div>
  );
}

export default function PomodoroPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMinutes: 0, totalSessions: 0, byDay: {} });
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>();

  const totalDuration = MODES[mode].duration * 60;
  const progress = timeLeft / totalDuration;

  const fetchHistory = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([
        api.get<Session[]>("/pomodoro/history?days=7"),
        api.get<Stats>("/pomodoro/stats?days=7"),
      ]);
      setSessions(h); setStats(s);
    } catch {} finally { setSessionsLoading(false); }
  }, []);

  useEffect(() => { if (user) fetchHistory(); }, [user, fetchHistory]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleComplete(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const switchMode = (m: Mode) => {
    if (isRunning) return;
    setMode(m);
    setTimeLeft(MODES[m].duration * 60);
  };

  const handleStart = async () => {
    if (!isRunning && !currentSessionId) {
      try {
        const sess = await api.post<{ _id: string }>("/pomodoro/start", {
          mode, plannedDuration: MODES[mode].duration, subject,
        });
        setCurrentSessionId(sess._id);
        startTimeRef.current = new Date();
      } catch {}
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleComplete = async (completed: boolean) => {
    if (currentSessionId) {
      const elapsed = startTimeRef.current
        ? Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 60000)
        : MODES[mode].duration;
      await api.patch(`/pomodoro/${currentSessionId}/end`, { actualDuration: elapsed, completed }).catch(() => {});
      setCurrentSessionId(null);
      fetchHistory();
    }
    if (completed && mode === "focus") {
      // Auto-notify with browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("STARVIS — Focus session complete! 🎉", { body: `Great work! Take a ${subject ? `break from ${subject}` : "break"}.` });
      }
    }
  };

  const handleReset = async () => {
    setIsRunning(false);
    if (currentSessionId) await handleComplete(false);
    setTimeLeft(MODES[mode].duration * 60);
  };

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMinutes = stats.byDay[todayKey] ?? 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString([], { weekday: "short" }) };
  });
  const maxDay = Math.max(...weekDays.map((d) => stats.byDay[d.key] ?? 0), 1);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"><Timer size={18} className="text-white" /></div>
            Pomodoro
          </h1>
          <p className="text-gray-500 text-sm mt-1">Deep work sessions · {stats.totalSessions} sessions this week</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="grid grid-cols-3 gap-3">
        {[
          { icon: <Clock size={16} className="text-orange-400" />, label: "Today", value: `${todayMinutes}m` },
          { icon: <Flame size={16} className="text-red-400" />, label: "This Week", value: `${stats.totalMinutes}m` },
          { icon: <CheckCircle size={16} className="text-emerald-400" />, label: "Sessions", value: stats.totalSessions },
        ].map(({ icon, label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
            <div className="text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Timer */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.15 } }} className="flex flex-col items-center gap-6">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([m, cfg]) => (
            <button key={m} onClick={() => switchMode(m)} disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === m ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              style={mode === m ? { background: cfg.bg, color: cfg.color } : {}}>
              {cfg.icon}{cfg.label}
            </button>
          ))}
        </div>

        {/* Circle timer */}
        <CircularTimer progress={progress} mode={mode} time={timeLeft} />

        {/* Subject input */}
        <Input placeholder="What are you studying? (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={isRunning}
          className="max-w-xs bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-center text-sm" />

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={handleReset} disabled={!currentSessionId && !isRunning}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/40 transition-all disabled:opacity-30">
            <RotateCcw size={16} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={isRunning ? handlePause : handleStart}
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${MODES[mode].color}, ${MODES[mode].color}cc)`, boxShadow: `0 8px 24px ${MODES[mode].color}40` }}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
          </motion.button>
          <button onClick={() => Notification.requestPermission()} title="Enable notifications"
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/40 transition-all">
            🔔
          </button>
        </div>
      </motion.div>

      {/* Weekly bar chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-orange-400" />Weekly Focus Minutes</h3>
        <div className="flex items-end gap-2 h-28">
          {weekDays.map(({ key, label }) => {
            const mins = stats.byDay[key] ?? 0;
            const h = (mins / maxDay) * 100;
            const isToday = key === todayKey;
            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-600">{mins > 0 ? `${mins}m` : ""}</span>
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${h}%`, minHeight: mins > 0 ? "4px" : "0", background: isToday ? "#f97316" : "rgba(139,92,246,0.5)" }} />
                <span className={`text-[10px] ${isToday ? "text-orange-400 font-semibold" : "text-gray-600"}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent sessions */}
      {sessions.slice(0, 5).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Target size={16} className="text-purple-400" />Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.completed ? "#34d399" : "#6b7280" }} />
                  <span className="text-gray-300 text-sm">{s.subject || "Focus session"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{s.actualDuration ?? s.plannedDuration}m</span>
                  <span>{new Date(s.startedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
