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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import SpaceBackground from "@/components/SpaceBackground";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Brain, Target, Clock, Award } from "lucide-react";

const weeklyData = [
  { name: "Mon", Study: 4, Target: 5 },
  { name: "Tue", Study: 3, Target: 5 },
  { name: "Wed", Study: 6, Target: 5 },
  { name: "Thu", Study: 5, Target: 5 },
  { name: "Fri", Study: 4.5, Target: 5 },
  { name: "Sat", Study: 7, Target: 5 },
  { name: "Sun", Study: 2, Target: 5 },
];

const subjectData = [
  { subject: "Math", score: 85, sessions: 12 },
  { subject: "Science", score: 92, sessions: 9 },
  { subject: "History", score: 78, sessions: 6 },
  { subject: "Web Dev", score: 88, sessions: 14 },
  { subject: "Chemistry", score: 75, sessions: 7 },
  { subject: "Physics", score: 80, sessions: 8 },
];

const radarData = [
  { subject: "Consistency", A: 82 },
  { subject: "Focus", A: 75 },
  { subject: "Retention", A: 88 },
  { subject: "Speed", A: 65 },
  { subject: "Output", A: 91 },
  { subject: "Review", A: 70 },
];

const trendData = [
  { week: "W1", hours: 18, efficiency: 60 },
  { week: "W2", hours: 22, efficiency: 65 },
  { week: "W3", hours: 20, efficiency: 70 },
  { week: "W4", hours: 27, efficiency: 75 },
  { week: "W5", hours: 30, efficiency: 80 },
  { week: "W6", hours: 28, efficiency: 85 },
  { week: "W7", hours: 34, efficiency: 88 },
];

const chartStyle = {
  tooltip: {
    contentStyle: {
      backgroundColor: "rgba(5,5,20,0.95)",
      border: "1px solid rgba(139,92,246,0.3)",
      borderRadius: "8px",
      color: "white",
    },
  },
  tick: { fill: "rgba(255,255,255,0.6)", fontSize: 12 },
  grid: { stroke: "rgba(255,255,255,0.06)" },
};

const statCards = [
  { label: "Avg Daily Hours", value: "4.5h", icon: <Clock size={20} />, color: "text-blue-300", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Weekly Streak", value: "12 days 🔥", icon: <Flame size={20} />, color: "text-orange-300", bg: "bg-orange-500/10 border-orange-500/20" },
  { label: "Efficiency Score", value: "88%", icon: <Brain size={20} />, color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/20" },
  { label: "Sessions Done", value: "56", icon: <Target size={20} />, color: "text-green-300", bg: "bg-green-500/10 border-green-500/20" },
];

export default function StudyAnalytics() {
  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen">
      <SpaceBackground />
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
            <TrendingUp className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Study Analytics</h1>
            <p className="text-sm text-gray-400">Track your learning performance over time</p>
          </div>
          <Badge className="ml-auto bg-purple-600/30 text-purple-200 border-purple-500/30">
            <Award size={12} className="mr-1" /> This Month
          </Badge>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Card className={`${s.bg} border text-white`}>
                <CardContent className="pt-4 pb-3">
                  <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly hours vs target */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Study Hours vs. Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid.stroke} vertical={false} />
                  <XAxis dataKey="name" tick={chartStyle.tick} axisLine={false} tickLine={false} />
                  <YAxis tick={chartStyle.tick} axisLine={false} tickLine={false} />
                  <Tooltip {...chartStyle.tooltip} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                  <Bar dataKey="Study" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Row: Progress trend + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Hours & Efficiency Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid.stroke} vertical={false} />
                    <XAxis dataKey="week" tick={chartStyle.tick} axisLine={false} tickLine={false} />
                    <YAxis tick={chartStyle.tick} axisLine={false} tickLine={false} />
                    <Tooltip {...chartStyle.tooltip} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                    <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#hoursGrad)" strokeWidth={2} dot={{ r: 3 }} />
                    <Area type="monotone" dataKey="efficiency" stroke="#34d399" fill="url(#effGrad)" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Study Skills Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                    <PolarRadiusAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Radar name="Score" dataKey="A" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip {...chartStyle.tooltip} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subject performance table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Subject Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjectData
                  .sort((a, b) => b.score - a.score)
                  .map((s, i) => (
                    <motion.div
                      key={s.subject}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-sm text-gray-300 w-20">{s.subject}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: s.score >= 90 ? "#34d399" : s.score >= 80 ? "#8b5cf6" : s.score >= 70 ? "#fbbf24" : "#f87171",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.05, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{s.score}%</span>
                      <span className="text-xs text-gray-500 w-20 text-right">{s.sessions} sessions</span>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
