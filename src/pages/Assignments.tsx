import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import SpaceBackground from "@/components/SpaceBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, BookOpen, Filter } from "lucide-react";

type Status = "Not Started" | "In Progress" | "Completed";
type Priority = "Low" | "Medium" | "High";

interface Assignment {
  id: string;
  course: string;
  assignment: string;
  dueDate: string;
  status: Status;
  priority: Priority;
}

const defaultAssignments: Assignment[] = [
  { id: "1", course: "Mathematics", assignment: "Problem Set 1", dueDate: "2026-04-10", status: "Completed", priority: "Medium" },
  { id: "2", course: "History", assignment: "Essay on Industrial Revolution", dueDate: "2026-04-15", status: "In Progress", priority: "High" },
  { id: "3", course: "Web Development", assignment: "Project Milestone 2", dueDate: "2026-04-20", status: "In Progress", priority: "High" },
  { id: "4", course: "Chemistry", assignment: "Lab Report 3", dueDate: "2026-04-22", status: "Not Started", priority: "Medium" },
  { id: "5", course: "Physics", assignment: "Chapter 5 Homework", dueDate: "2026-04-25", status: "Not Started", priority: "Low" },
];

const statusConfig: Record<Status, { color: string; icon: React.ReactNode; badgeClass: string }> = {
  "Not Started": {
    color: "text-gray-400",
    icon: <Clock size={14} />,
    badgeClass: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  },
  "In Progress": {
    color: "text-yellow-400",
    icon: <AlertTriangle size={14} />,
    badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  Completed: {
    color: "text-green-400",
    icon: <CheckCircle size={14} />,
    badgeClass: "bg-green-500/20 text-green-300 border-green-500/40",
  },
};

const priorityConfig: Record<Priority, { badgeClass: string }> = {
  Low: { badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  Medium: { badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  High: { badgeClass: "bg-red-500/20 text-red-300 border-red-500/40" },
};

function getDaysUntilDue(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function DueDateBadge({ dueDate, status }: { dueDate: string; status: Status }) {
  if (status === "Completed") return <span className="text-gray-500 text-xs">{dueDate}</span>;
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return <span className="text-red-400 text-xs font-semibold">Overdue ({Math.abs(days)}d ago)</span>;
  if (days <= 3) return <span className="text-orange-400 text-xs font-semibold">Due in {days}d ⚠️</span>;
  return <span className="text-gray-300 text-xs">{dueDate}</span>;
}

const STORAGE_KEY = "starvis_assignments";

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultAssignments;
    } catch {
      return defaultAssignments;
    }
  });

  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    course: "",
    assignment: "",
    dueDate: "",
    status: "Not Started" as Status,
    priority: "Medium" as Priority,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  const addAssignment = () => {
    if (!newForm.course.trim() || !newForm.assignment.trim() || !newForm.dueDate) return;
    const entry: Assignment = { ...newForm, id: Date.now().toString() };
    setAssignments((prev) => [entry, ...prev]);
    setNewForm({ course: "", assignment: "", dueDate: "", status: "Not Started", priority: "Medium" });
    setDialogOpen(false);
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const cycleStatus = (id: string) => {
    const order: Status[] = ["Not Started", "In Progress", "Completed"];
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: order[(order.indexOf(a.status) + 1) % order.length] } : a
      )
    );
  };

  const filtered = assignments.filter((a) => {
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchPriority = filterPriority === "All" || a.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const stats = {
    total: assignments.length,
    completed: assignments.filter((a) => a.status === "Completed").length,
    inProgress: assignments.filter((a) => a.status === "In Progress").length,
    notStarted: assignments.filter((a) => a.status === "Not Started").length,
  };

  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen">
      <SpaceBackground />
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
              <BookOpen className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Assignment Manager</h1>
              <p className="text-sm text-gray-400">Track and manage your coursework</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Plus size={16} /> Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0e23] border-purple-400/30 text-white">
              <DialogHeader>
                <DialogTitle>New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label>Course</Label>
                  <Input
                    placeholder="e.g. Mathematics"
                    value={newForm.course}
                    onChange={(e) => setNewForm((f) => ({ ...f, course: e.target.value }))}
                    className="bg-white/5 border-purple-400/30 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Assignment Title</Label>
                  <Input
                    placeholder="e.g. Problem Set 3"
                    value={newForm.assignment}
                    onChange={(e) => setNewForm((f) => ({ ...f, assignment: e.target.value }))}
                    className="bg-white/5 border-purple-400/30 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newForm.dueDate}
                    onChange={(e) => setNewForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="bg-white/5 border-purple-400/30 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select value={newForm.status} onValueChange={(v) => setNewForm((f) => ({ ...f, status: v as Status }))}>
                      <SelectTrigger className="bg-white/5 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Priority</Label>
                    <Select value={newForm.priority} onValueChange={(v) => setNewForm((f) => ({ ...f, priority: v as Priority }))}>
                      <SelectTrigger className="bg-white/5 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addAssignment} className="w-full bg-purple-600 hover:bg-purple-700">
                  Add Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total", value: stats.total, color: "bg-purple-600/20 border-purple-500/30" },
            { label: "Not Started", value: stats.notStarted, color: "bg-gray-600/20 border-gray-500/30" },
            { label: "In Progress", value: stats.inProgress, color: "bg-yellow-600/20 border-yellow-500/30" },
            { label: "Completed", value: stats.completed, color: "bg-green-600/20 border-green-500/30" },
          ].map((s) => (
            <Card key={s.label} className={`${s.color} border text-white text-center py-3`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 mb-4 items-center"
        >
          <Filter size={16} className="text-gray-400" />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status | "All")}>
            <SelectTrigger className="w-[150px] bg-white/5 border-purple-400/30 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | "All")}>
            <SelectTrigger className="w-[150px] bg-white/5 border-purple-400/30 text-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0e23] border-purple-400/30 text-white">
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-gray-500 text-sm ml-auto">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""}</span>
        </motion.div>

        {/* Assignment List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-500"
              >
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>No assignments found.</p>
              </motion.div>
            ) : (
              filtered
                .sort((a, b) => {
                  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((item, i) => {
                  const cfg = statusConfig[item.status];
                  const pcfg = priorityConfig[item.priority];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group flex items-center gap-4 p-4 rounded-xl border bg-black/20 backdrop-blur-sm hover:bg-white/5 transition-all duration-200 ${
                        item.status === "Completed" ? "border-green-500/20 opacity-70" : "border-purple-400/20"
                      }`}
                    >
                      {/* Status toggle button */}
                      <button
                        onClick={() => cycleStatus(item.id)}
                        className={`flex-shrink-0 transition-transform hover:scale-110 ${cfg.color}`}
                        title="Click to cycle status"
                      >
                        {cfg.icon}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-white ${item.status === "Completed" ? "line-through text-gray-500" : ""}`}>
                            {item.assignment}
                          </span>
                          <Badge className={`text-[10px] px-2 py-0 border ${pcfg.badgeClass}`}>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-purple-300">{item.course}</span>
                          <span className="text-gray-600">·</span>
                          <DueDateBadge dueDate={item.dueDate} status={item.status} />
                        </div>
                      </div>

                      {/* Status badge */}
                      <Badge className={`text-[10px] px-2 py-0.5 border flex items-center gap-1 ${cfg.badgeClass}`}>
                        {cfg.icon}
                        {item.status}
                      </Badge>

                      {/* Delete */}
                      <button
                        onClick={() => deleteAssignment(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
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
