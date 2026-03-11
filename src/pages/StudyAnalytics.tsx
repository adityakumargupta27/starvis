import { motion } from "framer-motion";
import { TrendingUp, Target, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 78 },
  { day: "Wed", score: 65 },
  { day: "Thu", score: 82 },
  { day: "Fri", score: 88 },
  { day: "Sat", score: 76 },
  { day: "Sun", score: 91 },
];

const subjectData = [
  { name: "Math", value: 35 },
  { name: "Physics", value: 25 },
  { name: "CS", value: 25 },
  { name: "English", value: 15 },
];

const PIE_COLORS = ["#9CD5FF", "#7AAACE", "#355872", "#b8d8eb"];

const statCards = [
  { icon: TrendingUp, label: "Avg Score", value: "79%", trend: "+5%" },
  { icon: Target, label: "Goals Met", value: "12/15", trend: "80%" },
  { icon: Clock, label: "Study Hours", value: "23.5h", trend: "+2.3h" },
];

const StudyAnalytics = () => {
  return (
    <div className="min-h-screen pb-24 pt-6 px-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground mb-6">Your academic performance overview</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card-surface p-3 text-center"
          >
            <stat.icon size={18} className="mx-auto mb-1.5 text-secondary" />
            <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <span className="text-[10px] font-semibold text-primary">{stat.trend}</span>
          </motion.div>
        ))}
      </div>

      {/* Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-surface p-4 mb-6"
      >
        <h2 className="font-display font-semibold text-sm text-foreground mb-3">Weekly Performance</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 88%)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(205 25% 50%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(205 25% 50%)" }} domain={[50, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(210 20% 88%)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#7AAACE"
              strokeWidth={2.5}
              dot={{ fill: "#355872", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-surface p-4"
      >
        <h2 className="font-display font-semibold text-sm text-foreground mb-3">Study Time by Subject</h2>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={140}>
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
                paddingAngle={3}
              >
                {subjectData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {subjectData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i] }}
                />
                <span className="text-xs text-foreground">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudyAnalytics;
