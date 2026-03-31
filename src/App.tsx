import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { Sidebar } from "@/components/ui/sidebar";
import Dashboard from "./pages/Dashboard";
import StudyAnalytics from "./pages/StudyAnalytics";
import Assignments from "./pages/Assignments";
import TodoList from "./pages/TodoList";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import FloatingAssistant from "./components/FloatingAssistant";
import SpaceBackground from "@/components/SpaceBackground";

const queryClient = new QueryClient();

/** Protected layout — only renders if user is logged in */
function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Splash / loading screen
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, #01020f, #0a0e23)" }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/40">
            <span className="text-white text-2xl">✦</span>
          </div>
          <p className="text-purple-300 text-sm animate-pulse">Loading STARVIS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="relative flex w-full h-full overflow-hidden text-foreground">
      <SpaceBackground />
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<StudyAnalytics />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/todo" element={<TodoList />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
      <FloatingAssistant />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
