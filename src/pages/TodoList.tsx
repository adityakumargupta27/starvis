import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SpaceBackground from "@/components/SpaceBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckSquare, Square, ListTodo, Star } from "lucide-react";

type Priority = "Low" | "Medium" | "High";
type Category = "General" | "Study" | "Assignment" | "Personal" | "Exam Prep";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
}

const STORAGE_KEY = "starvis_todos";

const priorityConfig: Record<Priority, { badgeClass: string; dot: string }> = {
  Low: { badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40", dot: "bg-blue-400" },
  Medium: { badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", dot: "bg-yellow-400" },
  High: { badgeClass: "bg-red-500/20 text-red-300 border-red-500/40", dot: "bg-red-400" },
};

const categoryColors: Record<Category, string> = {
  General: "text-gray-400",
  Study: "text-purple-300",
  Assignment: "text-blue-300",
  Personal: "text-green-300",
  "Exam Prep": "text-red-300",
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");
  const [newCategory, setNewCategory] = useState<Category>("General");
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newText.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newText.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
    setNewText("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const filtered = tasks.filter((t) => {
    const matchCat = filterCategory === "All" || t.category === filterCategory;
    const matchDone = showCompleted || !t.completed;
    return matchCat && matchDone;
  });

  const pending = tasks.filter((t) => !t.completed).length;
  const done = tasks.filter((t) => t.completed).length;
  const completionPct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen">
      <SpaceBackground />
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
            <ListTodo className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">To-Do List</h1>
            <p className="text-sm text-gray-400">
              {pending} pending · {done} done · {completionPct}% complete
            </p>
          </div>
        </motion.div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="mb-5 h-1.5 bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {/* Add task form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-black/30 backdrop-blur-sm border-purple-400/20 text-white mb-5">
            <CardContent className="pt-5 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="bg-white/5 border-purple-400/30 text-white placeholder:text-gray-500 flex-1"
                />
                <Button
                  onClick={addTask}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                  disabled={!newText.trim()}
                >
                  <Plus size={18} />
                </Button>
              </div>
              <div className="flex gap-2">
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                  <SelectTrigger className="w-[130px] bg-white/5 border-purple-400/30 text-white text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
                    <SelectItem value="Low">🔵 Low</SelectItem>
                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                    <SelectItem value="High">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
                  <SelectTrigger className="flex-1 bg-white/5 border-purple-400/30 text-white text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
                    {(["General", "Study", "Assignment", "Personal", "Exam Prep"] as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as Category | "All")}>
            <SelectTrigger className="w-[140px] bg-white/5 border-purple-400/30 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
              <SelectItem value="All">All Categories</SelectItem>
              {(["General", "Study", "Assignment", "Personal", "Exam Prep"] as Category[]).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted((v) => !v)}
            className="bg-white/5 border-purple-400/30 text-gray-300 hover:text-white text-xs"
          >
            {showCompleted ? "Hide Done" : "Show Done"}
          </Button>
          {done > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs ml-auto"
            >
              <Trash2 size={12} className="mr-1" /> Clear {done} done
            </Button>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-500"
              >
                <Star size={40} className="mx-auto mb-3 opacity-20" />
                <p>No tasks here. Add something above! ✨</p>
              </motion.div>
            ) : (
              filtered
                .sort((a, b) => {
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  const po = { High: 0, Medium: 1, Low: 2 };
                  return po[a.priority] - po[b.priority];
                })
                .map((task, i) => {
                  const pc = priorityConfig[task.priority];
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group flex items-center gap-3 p-3.5 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:bg-white/5 ${
                        task.completed
                          ? "border-white/10 bg-white/3 opacity-50"
                          : "border-purple-400/20 bg-black/20"
                      }`}
                    >
                      {/* Priority dot */}
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${pc.dot}`} />

                      {/* Check */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-purple-300 transition-colors"
                      >
                        {task.completed ? (
                          <CheckSquare size={18} className="text-green-400" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm ${
                            task.completed ? "line-through text-gray-500" : "text-white"
                          }`}
                        >
                          {task.text}
                        </span>
                        <div className="flex gap-2 mt-0.5">
                          <span className={`text-[10px] ${categoryColors[task.category]}`}>
                            {task.category}
                          </span>
                        </div>
                      </div>

                      {/* Priority badge */}
                      <Badge className={`text-[10px] px-1.5 py-0 border ${pc.badgeClass} hidden group-hover:flex`}>
                        {task.priority}
                      </Badge>

                      {/* Delete */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
