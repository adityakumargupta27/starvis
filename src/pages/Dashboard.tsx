import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Clock, Calendar, Flame, Plus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyProfile, StudyProfile } from "@/hooks/useStudyProfile";
import { useAuth } from "@/contexts/AuthContext";

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "It always seems impossible until it's done. — Nelson Mandela",
  "Study hard, for the well is deep. — Richard Baxter",
  "Education is the passport to the future. — Malcolm X",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The more that you read, the more things you will know. — Dr. Seuss",
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-right">
      <div className="text-3xl font-bold text-white tabular-nums">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div className="text-xs text-gray-400">
        {time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

const SUBJECT_COLORS = ["#8b5cf6", "#34d399", "#fbbf24", "#f87171", "#60a5fa"];

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "rgba(5,5,20,0.95)",
    border: "1px solid rgba(139,92,246,0.3)",
    borderRadius: "8px",
    color: "white",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

/* ─── Onboarding / Profile Setup Modal ───────────────────────────────── */
interface OnboardingModalProps {
  initial: StudyProfile;
  onSave: (data: Partial<StudyProfile>) => void;
  onClose: () => void;
  isFirstTime: boolean;
}

function OnboardingModal({ initial, onSave, onClose, isFirstTime }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    course: initial.course || "",
    year: initial.year || "",
    totalCourses: initial.totalCourses || 5,
    dailyGoalHours: initial.dailyGoalHours || 4,
    studyStreakDays: initial.studyStreakDays || 0,
    subjects: initial.subjects?.length
      ? initial.subjects
      : [{ name: "", score: 0 }],
    myCourses: initial.myCourses?.length
      ? initial.myCourses
      : [{ name: "", progress: 0 }],
    weeklyHours: initial.weeklyHours?.length
      ? initial.weeklyHours
      : [
          { day: "Mon", study: 0, procrastination: 0 },
          { day: "Tue", study: 0, procrastination: 0 },
          { day: "Wed", study: 0, procrastination: 0 },
          { day: "Thu", study: 0, procrastination: 0 },
          { day: "Fri", study: 0, procrastination: 0 },
          { day: "Sat", study: 0, procrastination: 0 },
        ],
  });

  const setF = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addSubject = () =>
    setF("subjects", [...form.subjects, { name: "", score: 0 }]);
  const updateSubject = (i: number, key: "name" | "score", val: string | number) =>
    setF("subjects", form.subjects.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  const removeSubject = (i: number) =>
    setF("subjects", form.subjects.filter((_, idx) => idx !== i));

  const addCourse = () =>
    setF("myCourses", [...form.myCourses, { name: "", progress: 0 }]);
  const updateCourse = (i: number, key: "name" | "progress", val: string | number) =>
    setF("myCourses", form.myCourses.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
  const removeCourse = (i: number) =>
    setF("myCourses", form.myCourses.filter((_, idx) => idx !== i));

  const updateWeekly = (i: number, key: "study" | "procrastination", val: number) =>
    setF("weeklyHours", form.weeklyHours.map((w, idx) => idx === i ? { ...w, [key]: val } : w));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const inputCls = "w-full bg-white/5 border border-purple-400/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-400/60";
  const steps = ["Basics", "Subjects", "My Courses", "Weekly Hours"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        className="w-full max-w-lg rounded-2xl border border-purple-500/30 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #07091a, #0d1026)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">
              {isFirstTime ? "🚀 Set up your Dashboard" : "✏️ Edit Dashboard Data"}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {isFirstTime ? "Fill in your details to personalize your stats" : "Update your study information"}
            </p>
          </div>
          {!isFirstTime && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Step pills */}
        <div className="flex gap-2 px-6 py-3 border-b border-white/5">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                step === i
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-purple-400/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-5 max-h-[380px] overflow-y-auto space-y-4">
          {/* Step 0: Basics */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Course / Degree</label>
                  <input
                    className={inputCls}
                    placeholder="B.Tech CSE"
                    value={form.course}
                    onChange={(e) => setF("course", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Year</label>
                  <input
                    className={inputCls}
                    placeholder="2nd Year"
                    value={form.year}
                    onChange={(e) => setF("year", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Total Courses Enrolled</label>
                  <input
                    type="number"
                    className={inputCls}
                    min={1}
                    value={form.totalCourses}
                    onChange={(e) => setF("totalCourses", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Daily Study Goal (hrs)</label>
                  <input
                    type="number"
                    className={inputCls}
                    min={1}
                    max={24}
                    value={form.dailyGoalHours}
                    onChange={(e) => setF("dailyGoalHours", parseFloat(e.target.value) || 4)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Current Study Streak (days)</label>
                <input
                  type="number"
                  className={inputCls}
                  min={0}
                  value={form.studyStreakDays}
                  onChange={(e) => setF("studyStreakDays", parseInt(e.target.value) || 0)}
                />
              </div>
            </>
          )}

          {/* Step 1: Subjects */}
          {step === 1 && (
            <>
              <p className="text-xs text-gray-400">Add your subjects and performance scores (0–100)</p>
              <div className="space-y-2">
                {form.subjects.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className={inputCls + " flex-1"}
                      placeholder="Subject name"
                      value={s.name}
                      onChange={(e) => updateSubject(i, "name", e.target.value)}
                    />
                    <input
                      type="number"
                      className={inputCls + " w-20"}
                      placeholder="Score"
                      min={0}
                      max={100}
                      value={s.score}
                      onChange={(e) => updateSubject(i, "score", parseInt(e.target.value) || 0)}
                    />
                    <button
                      onClick={() => removeSubject(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSubject}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus size={14} /> Add Subject
              </button>
            </>
          )}

          {/* Step 2: My Courses */}
          {step === 2 && (
            <>
              <p className="text-xs text-gray-400">Add your active courses and their completion progress %</p>
              <div className="space-y-2">
                {form.myCourses.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className={inputCls + " flex-1"}
                      placeholder="Course name"
                      value={c.name}
                      onChange={(e) => updateCourse(i, "name", e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className={inputCls + " w-20"}
                        placeholder="%"
                        min={0}
                        max={100}
                        value={c.progress}
                        onChange={(e) => updateCourse(i, "progress", parseInt(e.target.value) || 0)}
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                    <button
                      onClick={() => removeCourse(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addCourse}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus size={14} /> Add Course
              </button>
            </>
          )}

          {/* Step 3: Weekly Hours */}
          {step === 3 && (
            <>
              <p className="text-xs text-gray-400">Enter study hours for each day this week</p>
              <div className="space-y-2">
                {form.weeklyHours.map((w, i) => (
                  <div key={w.day} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-8">{w.day}</span>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 space-y-0.5">
                        <label className="text-[10px] text-purple-400">Study hrs</label>
                        <input
                          type="number"
                          className={inputCls}
                          min={0}
                          max={24}
                          step={0.5}
                          value={w.study}
                          onChange={(e) => updateWeekly(i, "study", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <label className="text-[10px] text-red-400">Distraction hrs</label>
                        <input
                          type="number"
                          className={inputCls}
                          min={0}
                          max={24}
                          step={0.5}
                          value={w.procrastination}
                          onChange={(e) => updateWeekly(i, "procrastination", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transition-colors"
              >
                <Check size={14} /> Save & Apply
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { profile, saveProfile } = useStudyProfile();
  const { user } = useAuth();
  const [showSetup, setShowSetup] = useState(false);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  const summaryData = [
    { title: "Total Courses", value: String(profile.totalCourses || 0), icon: <BookOpen className="h-7 w-7 text-purple-400" /> },
    { title: "Assignments Due", value: "—", icon: <FileText className="h-7 w-7 text-blue-400" /> },
    { title: "Daily Study Goal", value: `${profile.dailyGoalHours}h`, icon: <Clock className="h-7 w-7 text-orange-400" /> },
    { title: "Upcoming Exams", value: "—", icon: <Calendar className="h-7 w-7 text-red-400" /> },
  ];

  const chartSubjectData = (profile.subjects || [])
    .filter((s) => s.name)
    .map((s) => ({ name: s.name, value: s.score }));

  const chartWeeklyData = (profile.weeklyHours || []).map((w) => ({
    name: w.day,
    Study: w.study,
    Procrastination: w.procrastination,
  }));

  // Build weekly trend from weekly hours (cumulative sum per day for line chart)
  const chartTrendData = (profile.weeklyHours || []).map((w, i) => ({
    name: w.day,
    value: (profile.weeklyHours || []).slice(0, i + 1).reduce((acc, d) => acc + d.study, 0),
  }));

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showSetup && (
          <OnboardingModal
            initial={profile}
            onSave={saveProfile}
            onClose={() => setShowSetup(false)}
            isFirstTime={!isSetup}
          />
        )}
      </AnimatePresence>

      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <button
              onClick={() => setShowSetup(true)}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 bg-purple-600/10 px-2.5 py-1 rounded-full transition-colors"
            >
              ✏️ Edit data
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}! ` : ""}
            {profile.course && (
              <span className="text-gray-500 italic">
                {profile.course} · {profile.year}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-600 mt-0.5 italic">"{quote}"</p>
        </div>
        <LiveClock />
      </motion.div>

      {/* Streak banner */}
      {profile.studyStreakDays > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/10 border border-orange-500/20"
        >
          <Flame className="text-orange-400 h-5 w-5 flex-shrink-0" />
          <span className="text-orange-200 text-sm font-medium">
            🔥 {profile.studyStreakDays}-day study streak! Keep it up!
          </span>
        </motion.div>
      )}

      {/* Summary cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {summaryData.map((data) => (
          <motion.div key={data.title} variants={item}>
            <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white hover:border-purple-400/40 hover:bg-white/5 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{data.title}</CardTitle>
                <div className="transition-transform duration-300 group-hover:scale-110">{data.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        <Card className="col-span-4 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <CardTitle className="text-base">Study Hours vs. Distraction</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {chartWeeklyData.some((d) => d.Study > 0 || d.Procrastination > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                  <Bar dataKey="Study" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Procrastination" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-center gap-2">
                <p className="text-gray-500 text-sm">No weekly data yet.</p>
                <button onClick={() => setShowSetup(true)} className="text-xs text-purple-400 hover:text-purple-300 underline">
                  Add your study hours →
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <CardTitle className="text-base">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {chartSubjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartSubjectData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {chartSubjectData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-center gap-2">
                <p className="text-gray-500 text-sm">No subjects added yet.</p>
                <button onClick={() => setShowSetup(true)} className="text-xs text-purple-400 hover:text-purple-300 underline">
                  Add subjects →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="md:col-span-2 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <CardTitle className="text-base">Weekly Study Trend (Cumulative hrs)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#a78bfa" }}
                  activeDot={{ r: 7, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">My Courses</CardTitle>
              <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/30 text-xs">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {profile.myCourses?.filter((c) => c.name).length > 0 ? (
              <div className="space-y-5">
                {profile.myCourses.filter((c) => c.name).map((course) => (
                  <div key={course.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center text-sm gap-2">
                        <BookOpen className="h-4 w-4 text-purple-300" />
                        <span className="truncate max-w-[120px]">{course.name}</span>
                      </div>
                      <span className="font-semibold text-sm">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                <p className="text-gray-500 text-sm">No courses added.</p>
                <button onClick={() => setShowSetup(true)} className="text-xs text-purple-400 hover:text-purple-300 underline">
                  Add courses →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
