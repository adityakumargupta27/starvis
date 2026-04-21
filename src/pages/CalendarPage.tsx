import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  X,
  Trash2,
  Pencil,
  Check,
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

const typeConfig: Record<EventType, { color: string; bg: string; dot: string; icon: React.ReactNode; label: string }> = {
  exam:       { color: "text-red-300",    bg: "bg-red-500/20 border-red-500/30",       dot: "bg-red-400",    icon: <Sigma size={12} />,      label: "Exam" },
  assignment: { color: "text-blue-300",   bg: "bg-blue-500/20 border-blue-500/30",     dot: "bg-blue-400",   icon: <BookOpen size={12} />,    label: "Assignment" },
  study:      { color: "text-purple-300", bg: "bg-purple-500/20 border-purple-500/30", dot: "bg-purple-400", icon: <FlaskConical size={12} />, label: "Study" },
  class:      { color: "text-green-300",  bg: "bg-green-500/20 border-green-500/30",   dot: "bg-green-400",  icon: <Laptop size={12} />,      label: "Class" },
};

const SEED_EVENTS: CalEvent[] = [
  // Start empty — user adds their own
];

const STORAGE_KEY = "starvis_calendar_events";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toKey(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function genId() { return Math.random().toString(36).slice(2) + Date.now(); }

/* ─── Event Modal ──────────────────────────────────────────────────────── */
interface EventModalProps {
  date: string;
  event?: CalEvent;
  onSave: (e: CalEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function EventModal({ date, event, onSave, onDelete, onClose }: EventModalProps) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title || "");
  const [type, setType] = useState<EventType>(event?.type || "study");
  const [time, setTime] = useState(event?.time || "");
  const [course, setCourse] = useState(event?.course || "");
  const [editDate, setEditDate] = useState(event?.date || date);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: event?.id || genId(),
      title: title.trim(),
      date: editDate,
      type,
      time: time || undefined,
      course: course.trim() || undefined,
    });
    onClose();
  };

  const inputCls = "w-full bg-white/5 border border-purple-400/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-400/60 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        className="w-full max-w-md rounded-2xl border border-purple-500/30 overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg, #07091a, #0d1026)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">
            {isEdit ? "✏️ Edit Event" : "➕ Add Event"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Event Title *</label>
            <input
              autoFocus
              className={inputCls}
              placeholder="e.g. Math Exam, Study Session..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([t, cfg]) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                    type === t
                      ? `${cfg.bg} ${cfg.color} border-current`
                      : "bg-white/5 border-white/10 text-gray-500 hover:border-purple-400/30"
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Date</label>
              <input
                type="date"
                className={inputCls + " [color-scheme:dark]"}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Time (optional)</label>
              <input
                className={inputCls}
                placeholder="e.g. 10:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Course */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Course / Subject (optional)</label>
            <input
              className={inputCls}
              placeholder="e.g. Mathematics"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          {isEdit && onDelete ? (
            <button
              onClick={() => { onDelete(event!.id); onClose(); }}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check size={13} /> {isEdit ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── CalendarPage ─────────────────────────────────────────────────────── */
export default function CalendarPage() {
  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(todayKey);
  const [events, setEvents] = useState<CalEvent[]>(SEED_EVENTS);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    date: string;
    event?: CalEvent;
  }>({ open: false, date: todayKey });

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persist = (next: CalEvent[]) => {
    setEvents(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addOrUpdateEvent = (e: CalEvent) => {
    const next = events.some((x) => x.id === e.id)
      ? events.map((x) => (x.id === e.id ? e : x))
      : [...events, e];
    persist(next);
    // Jump to the saved event's date
    setSelected(e.date);
    const d = new Date(e.date + "T00:00:00");
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const deleteEvent = (id: string) => {
    persist(events.filter((x) => x.id !== id));
  };

  const openAdd = (date: string) => setModal({ open: true, date });
  const openEdit = (event: CalEvent) => setModal({ open: true, date: event.date, event });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

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

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const upcomingEvents = events
    .filter(e => e.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6 min-h-screen pb-24">
      <SpaceBackground />

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <EventModal
            date={modal.date}
            event={modal.event}
            onSave={addOrUpdateEvent}
            onDelete={deleteEvent}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/30">
              <CalendarDays className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Calendar</h1>
              <p className="text-sm text-gray-400">Your academic schedule</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => openAdd(selected)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/40 transition-colors"
          >
            <Plus size={15} /> Add Event
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Calendar Grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-lg font-bold">{MONTHS[viewMonth]} {viewYear}</h2>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
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
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelected(key)}
                        onDoubleClick={() => openAdd(key)}
                        title="Click to select · Double-click to add event"
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
                                className={`w-1.5 h-1.5 rounded-full ${typeConfig[e.type].dot}`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[8px] text-gray-500">+{dayEvents.length - 3}</span>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Legend + tip */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 flex-wrap gap-2">
                  <div className="flex gap-4 flex-wrap">
                    {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([type, cfg]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-gray-400 capitalize">{type}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-600">Double-click a date to add</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Right Panel ── */}
          <div className="space-y-4">

            {/* Selected day events */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-300">
                      {selected === todayKey ? "Today" : (() => {
                        const d = new Date(selected + "T00:00:00");
                        return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                      })()}
                    </CardTitle>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openAdd(selected)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-colors"
                    >
                      <Plus size={15} />
                    </motion.button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {selectedEvents.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2 py-5 text-center"
                      >
                        <p className="text-xs text-gray-500">No events. Free day! 🎉</p>
                        <button
                          onClick={() => openAdd(selected)}
                          className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors"
                        >
                          + Add one
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="events" className="space-y-2">
                        {selectedEvents.map((e, i) => {
                          const cfg = typeConfig[e.type];
                          return (
                            <motion.div
                              key={e.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`p-2.5 rounded-lg border ${cfg.bg} flex items-start gap-2 group cursor-pointer hover:brightness-110 transition-all`}
                              onClick={() => openEdit(e)}
                            >
                              <span className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-white truncate">{e.title}</p>
                                {e.time && (
                                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Clock size={9} /> {e.time}
                                  </p>
                                )}
                                {e.course && <p className="text-[10px] text-gray-500">{e.course}</p>}
                              </div>
                              <Pencil size={11} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0" />
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming events */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-300">Upcoming</CardTitle>
                    {upcomingEvents.length > 0 && (
                      <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 text-[9px]">
                        {upcomingEvents.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 max-h-72 overflow-y-auto">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">No upcoming events</p>
                      <button
                        onClick={() => openAdd(todayKey)}
                        className="text-xs text-purple-400 hover:text-purple-300 underline mt-1 transition-colors"
                      >
                        + Schedule something
                      </button>
                    </div>
                  ) : (
                    upcomingEvents.map((e, i) => {
                      const cfg = typeConfig[e.type];
                      const d = new Date(e.date + "T00:00:00");
                      const label = e.date === todayKey ? "Today" :
                        d.toLocaleDateString([], { month: "short", day: "numeric" });
                      return (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.06 }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 transition-colors group"
                          onClick={() => {
                            setSelected(e.date);
                            const dt = new Date(e.date + "T00:00:00");
                            setViewYear(dt.getFullYear());
                            setViewMonth(dt.getMonth());
                          }}
                        >
                          <div className={`w-1 h-8 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{e.title}</p>
                            <p className="text-[10px] text-gray-500">{label}{e.time && ` · ${e.time}`}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={`text-[9px] px-1.5 border ${cfg.bg} ${cfg.color} capitalize`}>
                              {e.type}
                            </Badge>
                            <button
                              onClick={(ev) => { ev.stopPropagation(); openEdit(e); }}
                              className="text-gray-600 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded"
                            >
                              <Pencil size={10} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
