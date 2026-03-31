import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  CheckSquare,
  CalendarDays,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/todo", label: "To-Do List", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-64 h-full border-r border-white/10 bg-black/20 backdrop-blur-xl">
      {/* Brand header */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-wide">STARVIS</h1>
            <p className="text-[10px] text-gray-500">Study Companion</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-purple-600/25 text-white border border-purple-500/30"
                  : "text-gray-400 hover:bg-white/6 hover:text-white border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={17}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? "text-purple-300" : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.initials || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name || "Student"}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
