
import { NavLink } from "react-router-dom";
import { Home, Mic, BarChart, BookOpen, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./button";

const navItems = [
  { to: "/", icon: <Home />, label: "Dashboard" },
  { to: "/voice", icon: <Mic />, label: "Voice Assistant" },
  { to: "/analytics", icon: <BarChart />, label: "Analytics" },
  { to: "/assignments", icon: <BookOpen />, label: "Assignments" },
];

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 bg-background border-r">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">AI Assistant</h2>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`
              }
            >
              {item.icon}
              <span className="ml-4">{item.label}</span>
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
          <SheetContent side="left">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">AI Assistant</h2>
            </div>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-4">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
