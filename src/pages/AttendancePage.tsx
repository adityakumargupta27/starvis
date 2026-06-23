import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, Trash2, CheckCircle, XCircle,
  AlertTriangle, BookOpen, X, ChevronDown, Loader2, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceSummary {
  _id: string; subject: string; total: number; present: number; absent: number;
  percentage: number; targetPercentage: number; belowTarget: boolean; classesNeeded: number;
}

interface AttendanceRecord { date: string; status: "present" | "absent" | "cancelled"; notes: string; }
interface AttendanceDetail extends AttendanceSummary { records: AttendanceRecord[]; }

function PercentBar({ pct, target }: { pct: number; target: number }) {
  const color = pct >= target ? "#34d399" : pct >= target - 10 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mt-2">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: `${target}%` }} />
    </div>
  );
}

function SubjectCard({ data, onMark, onDelete, onSelect }: { data: AttendanceSummary; onMark: (status: "present" | "absent" | "cancelled") => void; onDelete: () => void; onSelect: () => void; }) {
  const color = data.percentage >= data.targetPercentage ? "text-emerald-400" : data.percentage >= data.targetPercentage - 10 ? "text-yellow-400" : "text-red-400";
  const borderColor = data.percentage >= data.targetPercentage ? "border-emerald-500/20" : data.percentage >= data.targetPercentage - 10 ? "border-yellow-500/20" : "border-red-500/20";

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`group rounded-2xl border ${borderColor} bg-black/20 backdrop-blur-sm p-4 hover:bg-white/5 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{data.subject}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{data.present}/{data.total} classes attended</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${color}`}>{data.percentage}%</span>
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 p-1 transition-all"><Trash2 size={13} /></button>
        </div>
      </div>

      <PercentBar pct={data.percentage} target={data.targetPercentage} />
      <div className="flex items-center justify-between mt-1 mb-3">
        <span className="text-[10px] text-gray-600">0%</span>
        <span className="text-[10px] text-gray-500">Target: {data.targetPercentage}%</span>
        <span className="text-[10px] text-gray-600">100%</span>
      </div>

      {data.belowTarget && data.classesNeeded > 0 && (
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1.5 mb-3">
          <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-xs">Attend {data.classesNeeded} more classes to reach {data.targetPercentage}%</p>
        </div>
      )}

      {/* Quick mark buttons */}
      <div className="flex gap-2 mt-2">
        <button onClick={() => onMark("present")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all text-xs font-medium">
          <CheckCircle size={12} />Present
        </button>
        <button onClick={() => onMark("absent")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium">
          <XCircle size={12} />Absent
        </button>
        <button onClick={onSelect} className="px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all text-xs">
          History
        </button>
      </div>
    </motion.div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [newTarget, setNewTarget] = useState(75);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const fetchSubjects = async () => {
    try { const d = await api.get<AttendanceSummary[]>("/attendance"); setSubjects(d); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchSubjects(); }, [user]);

  const handleAdd = async () => {
    if (!newSubject.trim()) return;
    setAdding(true);
    try {
      await api.post("/attendance", { subject: newSubject.trim(), targetPercentage: newTarget });
      setNewSubject(""); setShowAdd(false);
      fetchSubjects();
    } catch (err: any) { alert(err.message); }
    finally { setAdding(false); }
  };

  const handleMark = async (id: string, status: "present" | "absent" | "cancelled") => {
    await api.post(`/attendance/${id}/mark`, { date: today, status });
    fetchSubjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subject?")) return;
    await api.delete(`/attendance/${id}`);
    setSubjects((p) => p.filter((s) => s._id !== id));
  };

  const overallPct = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + s.percentage, 0) / subjects.length) : 0;
  const dangerCount = subjects.filter((s) => s.belowTarget).length;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><BookOpen size={18} className="text-white" /></div>
            Attendance Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">{subjects.length} subjects · Today: {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white gap-2">
          <Plus size={15} />Add Subject
        </Button>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="grid grid-cols-3 gap-3">
        {[
          { label: "Overall", value: `${overallPct}%`, color: overallPct >= 75 ? "text-emerald-400" : "text-red-400" },
          { label: "Subjects", value: subjects.length, color: "text-cyan-400" },
          { label: "Below Target", value: dangerCount, color: dangerCount > 0 ? "text-yellow-400" : "text-gray-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Warning banner */}
      {dangerCount > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-200 text-sm">{dangerCount} subject{dangerCount > 1 ? "s are" : " is"} below your attendance target. Attend more classes to avoid issues.</p>
        </motion.div>
      )}

      {/* Subject cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-cyan-400" /></div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center"><BookOpen size={28} className="text-cyan-400" /></div>
          <div><p className="text-white font-semibold">No subjects added</p><p className="text-gray-500 text-sm mt-1">Add your subjects to track attendance</p></div>
          <Button onClick={() => setShowAdd(true)} className="bg-cyan-600 hover:bg-cyan-700 gap-2"><Plus size={14} />Add your first subject</Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {subjects.map((s) => (
              <SubjectCard key={s._id} data={s} onMark={(status) => handleMark(s._id, status)} onDelete={() => handleDelete(s._id)} onSelect={() => {}} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-cyan-500/30 p-6 space-y-4" style={{ background: "linear-gradient(135deg, #07091a, #0d1026)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">Add Subject</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Subject Name</label>
                  <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Data Structures" className="bg-white/5 border-cyan-400/30 text-white placeholder:text-gray-600" onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Attendance Target (%)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={60} max={100} value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1" />
                    <span className="text-white font-semibold w-10 text-right">{newTarget}%</span>
                  </div>
                </div>
              </div>
              <Button disabled={!newSubject.trim() || adding} onClick={handleAdd} className="w-full bg-cyan-600 hover:bg-cyan-700">
                {adding ? <Loader2 size={15} className="animate-spin mr-2" /> : <Plus size={15} className="mr-2" />}Add Subject
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
