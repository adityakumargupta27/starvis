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
import { BookOpen, FileText, Clock, Calendar, Sigma, FlaskConical, Laptop, Flame } from "lucide-react";
import { motion } from "framer-motion";

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

const summaryData = [
  { title: "Total Courses", value: "12", icon: <BookOpen className="h-7 w-7 text-purple-400" /> },
  { title: "Assignments Due", value: "5", icon: <FileText className="h-7 w-7 text-blue-400" /> },
  { title: "Avg. Study Time", value: "4.5h", icon: <Clock className="h-7 w-7 text-orange-400" /> },
  { title: "Upcoming Exams", value: "2", icon: <Calendar className="h-7 w-7 text-red-400" /> },
];

const studyData = [
  { name: "Mon", Study: 4, Procrastination: 1 },
  { name: "Tue", Study: 3, Procrastination: 2 },
  { name: "Wed", Study: 5, Procrastination: 1.5 },
  { name: "Thu", Study: 2, Procrastination: 3 },
  { name: "Fri", Study: 4.5, Procrastination: 1 },
  { name: "Sat", Study: 6, Procrastination: 0.5 },
];

const subjectPerformanceData = [
  { name: "Math", value: 85 },
  { name: "Science", value: 92 },
  { name: "History", value: 78 },
];
const SUBJECT_COLORS = ["#8b5cf6", "#34d399", "#fbbf24"];

const dailyStudyTrendData = [
  { name: "Week 1", value: 20 },
  { name: "Week 2", value: 25 },
  { name: "Week 3", value: 22 },
  { name: "Week 4", value: 28 },
  { name: "Week 5", value: 30 },
  { name: "Week 6", value: 35 },
];

const coursesData = [
  { name: "Mathematics", progress: 75, icon: <Sigma className="h-5 w-5 mr-2 text-purple-300" /> },
  { name: "Web Development", progress: 50, icon: <Laptop className="h-5 w-5 mr-2 text-blue-300" /> },
  { name: "Chemistry", progress: 86, icon: <FlaskConical className="h-5 w-5 mr-2 text-green-300" /> },
];

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

export default function Dashboard() {
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1 italic max-w-md">"{quote}"</p>
        </div>
        <LiveClock />
      </motion.div>

      {/* Streak banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/10 border border-orange-500/20"
      >
        <Flame className="text-orange-400 h-5 w-5 flex-shrink-0" />
        <span className="text-orange-200 text-sm font-medium">🔥 12-day study streak! Keep it up!</span>
      </motion.div>

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
            <CardTitle className="text-base">Study Hours vs. Procrastination</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <Tooltip {...chartTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                <Bar dataKey="Study" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Procrastination" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <CardTitle className="text-base">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={subjectPerformanceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                >
                  {subjectPerformanceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
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
            <CardTitle className="text-base">Daily Study Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyStudyTrendData}>
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
            <div className="space-y-5">
              {coursesData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center text-sm">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold text-sm">{item.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
