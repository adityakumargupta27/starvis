
import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./button";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
  { to: "/assignments", label: "Assignments" },
  { to: "/todo", label: "To-Do List" },
  { to: "/calendar", label: "Calendar" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 bg-background/30 border-r">
        <div className="mb-8 flex flex-col items-center">
          
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-all duration-200 ${
                  isActive ? "bg-purple-600/30 text-white" : "hover:bg-purple-600/20"
                }`
              }
            >
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-background/80 backdrop-blur-sm">
            <div className="mb-8 flex flex-col items-center">
               
            </div>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-all duration-200 ${
                      isActive ? "bg-purple-600/30 text-white" : "hover:bg-purple-600/20"
                    }`
                  }
                >
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
