import { motion } from "framer-motion";
import { Brain, BookOpen, Clock, Sparkles } from "lucide-react";

const timetableBlocks = [
  { time: "08:00", subject: "Mathematics", color: "bg-primary/30" },
  { time: "09:30", subject: "Physics", color: "bg-secondary/30" },
  { time: "11:00", subject: "Computer Science", color: "bg-primary/20" },
  { time: "13:00", subject: "English Literature", color: "bg-secondary/20" },
  { time: "14:30", subject: "Study Session", color: "bg-primary/40" },
];

const suggestions = [
  "Review Chapter 5 — Calculus derivatives",
  "Practice Physics problem set #3",
  "Revise CS algorithms before Friday quiz",
];

const Dashboard = () => {
  return (
    <div className="min-h-screen pb-24 pt-6 px-5">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground font-medium">Good morning 👋</p>
        <h1 className="text-2xl font-display font-bold text-foreground">Your Study Plan</h1>
      </motion.div>

      {/* AI Suggestions Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface p-4 mb-6 border border-primary/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <h2 className="font-display font-semibold text-sm text-foreground">AI Study Suggestions</h2>
        </div>
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Brain size={14} className="mt-0.5 shrink-0 text-secondary" />
              {s}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Timetable */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-secondary" />
          <h2 className="font-display font-semibold text-sm text-foreground">Today's Schedule</h2>
        </div>
        <div className="space-y-2">
          {timetableBlocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className={`card-surface flex items-center gap-4 p-3.5 ${block.color} border border-border/50`}
            >
              <span className="text-xs font-mono font-semibold text-muted-foreground w-12">
                {block.time}
              </span>
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-secondary" />
                <span className="text-sm font-medium text-foreground">{block.subject}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
