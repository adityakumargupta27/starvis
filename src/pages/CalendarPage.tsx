import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SpaceBackground from "@/components/SpaceBackground";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Clock,
  BookOpen,
  FlaskConical,
  Sigma,
  Laptop,
} from "lucide-react";

type EventType = "exam" | "assignment" | "study" | "class";

interface CalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  time?: string;
  course?: string;
}

const typeConfig: Record<EventType, { color: string; bg: string; icon: React.ReactNode }> = {
  exam: { color: "text-red-300", bg: "bg-red-500/20 border-red-500/30", icon: <Sigma size={12} /> },
  assignment: { color: "text-blue-300", bg: "bg-blue-500/20 border-blue-500/30", icon: <BookOpen size={12} /> },
  study: { color: "text-purple-300", bg: "bg-purple-500/20 border-purple-500/30", icon: <FlaskConical size={12} /> },
  class: { color: "text-green-300", bg: "bg-green-500/20 border-green-500/30", icon: <Laptop size={12} /> },
};

const INITIAL_EVENTS: CalEvent[] = [
  { id: "1", title: "Math Exam", date: "2026-04-05", type: "exam", time: "10:00 AM", course: "Mathematics" },
  { id: "2", title: "History Essay Due", date: "2026-04-10", type: "assignment", time: "11:59 PM", course: "History" },
  { id: "3", title: "Chemistry Lab", date: "2026-04-14", type: "class", time: "2:00 PM", course: "Chemistry" },
  { id: "4", title: "Web Dev Milestone", date: "2026-04-18", type: "assignment", time: "11:59 PM", course: "Web Dev" },
  { id: "5", title: "Study Session", date: "2026-04-20", type: "study", time: "6:00 PM" },
  { id: "6", title: "Physics Homework", date: "2026-04-22", type: "assignment", time: "11:59 PM", course: "Physics" },
  { id: "7", title: "Science Oral Exam", date: "2026-04-28", type: "exam", time: "9:00 AM", course: "Science" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toKey(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(toKey(today.getFullYear(), today.getMonth(), today.getDate()));
  const [events] = useState<CalEvent[]>(INITIAL_EVENTS);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
    else setViewMonth(m => m + 1);
  };

  const eventsByDate = events.reduce<Record<string, CalEvent[]>>((acc, e) => {
    acc[e.date] = [...(acc[e.date] || []), e];
    return acc;
  }, {});

  const selectedEvents = eventsByDate[selected] || [];
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const upcomingEvents = events
    .filter(e => e.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen">
      <SpaceBackground />
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
            <CalendarDays className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-sm text-gray-400">Your academic schedule at a glance</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
              <CardHeader className="pb-3">
                {/* Month nav */}
                <div className="flex items-center justify-between">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-lg font-bold">{MONTHS[viewMonth]} {viewYear}</h2>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
                {/* Day labels */}
                <div className="grid grid-cols-7 mt-3">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-500 font-semibold py-1">{d}</div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const key = toKey(viewYear, viewMonth, day);
                    const dayEvents = eventsByDate[key] || [];
                    const isToday = key === todayKey;
                    const isSelected = key === selected;
                    return (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setSelected(key)}
                        className={`
                          relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[52px] transition-all duration-200 text-sm
                          ${isSelected ? "bg-purple-600/50 border border-purple-400/60" : "hover:bg-white/8 border border-transparent"}
                          ${isToday && !isSelected ? "border border-purple-400/40" : ""}
                        `}
                      >
                        <span className={`font-semibold text-sm ${isToday ? "text-purple-300" : "text-white"}`}>
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                            {dayEvents.slice(0, 3).map(e => (
                              <div
                                key={e.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  e.type === "exam" ? "bg-red-400" :
                                  e.type === "assignment" ? "bg-blue-400" :
                                  e.type === "study" ? "bg-purple-400" : "bg-green-400"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 pt-3 border-t border-white/10 flex-wrap">
                  {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([type, cfg]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        type === "exam" ? "bg-red-400" :
                        type === "assignment" ? "bg-blue-400" :
                        type === "study" ? "bg-purple-400" : "bg-green-400"
                      }`} />
                      <span className="text-xs text-gray-400 capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Selected day events */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-300">
                      {selected === todayKey ? "Today" : selected}
                    </CardTitle>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-purple-300 hover:text-white hover:bg-purple-600/30">
                      <Plus size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence mode="wait">
                    {selectedEvents.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-gray-500 text-center py-4"
                      >
                        No events. Free day! 🎉
                      </motion.p>
                    ) : (
                      selectedEvents.map((e, i) => {
                        const cfg = typeConfig[e.type];
                        return (
                          <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-2.5 rounded-lg border ${cfg.bg} flex items-start gap-2`}
                          >
                            <span className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{e.title}</p>
                              {e.time && (
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Clock size={9} /> {e.time}
                                </p>
                              )}
                              {e.course && <p className="text-[10px] text-gray-500">{e.course}</p>}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming events */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-300">Upcoming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingEvents.map((e, i) => {
                    const cfg = typeConfig[e.type];
                    const d = new Date(e.date + "T00:00:00");
                    const label = d.toLocaleDateString([], { month: "short", day: "numeric" });
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.06 }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 transition-colors"
                        onClick={() => setSelected(e.date)}
                      >
                        <div className={`w-1 h-8 rounded-full ${
                          e.type === "exam" ? "bg-red-400" :
                          e.type === "assignment" ? "bg-blue-400" :
                          e.type === "study" ? "bg-purple-400" : "bg-green-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{e.title}</p>
                          <p className="text-[10px] text-gray-500">{label} {e.time && `· ${e.time}`}</p>
                        </div>
                        <Badge className={`text-[9px] px-1.5 border ${cfg.bg} ${cfg.color} capitalize`}>
                          {e.type}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
