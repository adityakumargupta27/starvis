import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import BottomNav from "@/components/BottomNav";
import { Sidebar } from "@/components/ui/sidebar";
import Dashboard from "./pages/Dashboard";
import StudyAnalytics from "./pages/StudyAnalytics";
import Assignments from "./pages/Assignments";
import TodoList from "./pages/TodoList";
import NotFound from "./pages/NotFound";
import FloatingAssistant from "./components/FloatingAssistant";
import SpaceBackground from "@/components/SpaceBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          {/*
           * Root layout:
           * - On mobile: full-screen, no sidebar, bottom nav shows
           * - On desktop (md+): sidebar on left, no bottom nav
           * - pt-safe / pb-safe handle iPhone notch + home indicator via CSS env()
           */}
          <div className="relative flex w-full h-full overflow-hidden text-foreground">
            <SpaceBackground />

            {/* Sidebar: hidden on mobile (<md), visible on desktop */}
            <div className="hidden md:block flex-shrink-0">
              <Sidebar />
            </div>

            {/* Main scrollable area */}
            <main
              className="flex-1 overflow-y-auto"
              style={{
                /* Top padding: status bar on iOS (safe area) */
                paddingTop: "env(safe-area-inset-top, 0px)",
                /* Bottom padding: home indicator + bottom nav height on mobile */
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)",
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<StudyAnalytics />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/todo" element={<TodoList />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Bottom nav: only shown on mobile (<md) */}
            <div className="md:hidden">
              <BottomNav />
            </div>
          </div>

          {/* Floating AI assistant (sits above everything) */}
          <FloatingAssistant />
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
