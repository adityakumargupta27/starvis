import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Layers,
  Timer,
  MoreHorizontal,
  Sparkles,
  FolderOpen,
  ClipboardList,
  CheckSquare,
  CalendarDays,
  BarChart3,
  CreditCard,
  Settings,
  X
} from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Main 4 quick tabs + More button
  const primaryTabs = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/notes", icon: FileText, label: "AI Notes" },
    { path: "/flashcards", icon: Layers, label: "Cards" },
    { path: "/pomodoro", icon: Timer, label: "Focus" },
  ];

  // Grid tools for the "More" popover/sheet
  const gridTools = [
    { path: "/study-planner", icon: Sparkles, label: "AI Planner", color: "text-amber-400" },
    { path: "/documents", icon: FolderOpen, label: "Docs", color: "text-blue-400" },
    { path: "/assignments", icon: ClipboardList, label: "Tasks", color: "text-emerald-400" },
    { path: "/todo", icon: CheckSquare, label: "Todos", color: "text-indigo-400" },
    { path: "/calendar", icon: CalendarDays, label: "Calendar", color: "text-rose-400" },
    { path: "/analytics", icon: BarChart3, label: "Analytics", color: "text-violet-400" },
    { path: "/billing", icon: CreditCard, label: "Billing", color: "text-teal-400" },
    { path: "/settings", icon: Settings, label: "Settings", color: "text-gray-400" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* --- Main Navigation Bar --- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10"
        style={{
          background: "rgba(6,9,24,0.85)",
          backdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around px-1 pt-1 pb-1">
          {primaryTabs.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl flex-1 text-white/50 transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-purple-500/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={`relative z-10 ${active ? "text-purple-300" : "text-white/40"}`}
                />
                <span
                  className={`relative z-10 text-[9px] font-medium leading-none ${
                    active ? "text-purple-300" : "text-white/40"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl flex-1 transition-colors ${
              isMenuOpen ? "text-purple-300" : "text-white/40"
            }`}
          >
            {isMenuOpen && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-xl bg-purple-500/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <MoreHorizontal
              size={20}
              className={`relative z-10 ${isMenuOpen ? "text-purple-300" : "text-white/40"}`}
            />
            <span className="relative z-10 text-[9px] font-medium leading-none">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* --- Sliding More Menu Overlay --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-45 rounded-t-3xl border-t border-white/10 px-6 pt-5 pb-24 md:hidden"
              style={{
                background: "linear-gradient(to top, rgba(6,8,22,0.99), rgba(12,15,36,0.99))",
                backdropFilter: "blur(24px)",
              }}
            >
              {/* Drag indicator/Handle */}
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-base">All Tools</h3>
                  <p className="text-[10px] text-gray-500">Access remaining features</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {gridTools.map((tool) => {
                  const active = location.pathname === tool.path;
                  return (
                    <button
                      key={tool.path}
                      onClick={() => handleNavigate(tool.path)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                          active
                            ? "bg-purple-600/35 border-purple-500 text-purple-200"
                            : "bg-white/4 border-white/5 text-white/70 hover:border-white/10"
                        }`}
                      >
                        <tool.icon size={18} className={tool.color} />
                      </div>
                      <span className="text-[10px] text-center font-medium text-gray-300 truncate w-full max-w-[64px]">
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
