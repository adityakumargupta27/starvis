import { Home, BarChart3, ClipboardList, CheckSquare, CalendarDays, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/assignments", icon: ClipboardList, label: "Tasks" },
  { path: "/todo", icon: CheckSquare, label: "Todos" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10"
      style={{
        background: "rgba(6,9,24,0.85)",
        backdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around px-1 pt-1 pb-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path ||
            (item.path === "/" && location.pathname === "/");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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
      </div>
    </nav>
  );
};

export default BottomNav;
