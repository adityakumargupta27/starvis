import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Calendar, AlertTriangle } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  due: string;
  completed: boolean;
  urgent: boolean;
}

const initialAssignments: Assignment[] = [
  { id: 1, title: "Calculus Problem Set 4", subject: "Mathematics", due: "Mar 12", completed: false, urgent: true },
  { id: 2, title: "Lab Report: Kinematics", subject: "Physics", due: "Mar 13", completed: false, urgent: false },
  { id: 3, title: "Essay: Modern Poetry", subject: "English", due: "Mar 15", completed: false, urgent: false },
  { id: 4, title: "Algorithm Analysis HW", subject: "Computer Science", due: "Mar 11", completed: true, urgent: false },
  { id: 5, title: "Linear Algebra Quiz Prep", subject: "Mathematics", due: "Mar 14", completed: false, urgent: true },
  { id: 6, title: "Database ER Diagram", subject: "Computer Science", due: "Mar 16", completed: true, urgent: false },
];

const Assignments = () => {
  const [assignments, setAssignments] = useState(initialAssignments);

  const toggle = (id: number) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const pending = assignments.filter((a) => !a.completed);
  const done = assignments.filter((a) => a.completed);

  return (
    <div className="dark min-h-screen bg-background pb-24 pt-6 px-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Assignments</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {pending.length} pending · {done.length} completed
        </p>
      </motion.div>

      {/* Pending */}
      <div className="space-y-2.5 mb-8">
        {pending.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggle(a.id)}
            className="card-surface bg-card flex items-start gap-3 p-4 cursor-pointer border border-primary/10 active:scale-[0.98] transition-transform"
          >
            <Circle size={20} className="mt-0.5 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">{a.title}</span>
                {a.urgent && <AlertTriangle size={13} className="shrink-0 text-destructive" />}
              </div>
              <p className="text-xs text-muted-foreground">{a.subject}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Calendar size={12} />
              {a.due}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Completed
          </p>
          <div className="space-y-2">
            {done.map((a) => (
              <motion.div
                key={a.id}
                layout
                onClick={() => toggle(a.id)}
                className="card-surface bg-card/50 flex items-start gap-3 p-4 cursor-pointer opacity-60 active:scale-[0.98] transition-transform"
              >
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground line-through truncate block">
                    {a.title}
                  </span>
                  <p className="text-xs text-muted-foreground">{a.subject}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Calendar size={12} />
                  {a.due}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Assignments;
