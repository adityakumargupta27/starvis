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
          <div className="relative flex min-h-screen text-foreground">
            <SpaceBackground />
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<StudyAnalytics />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/todo" element={<TodoList />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
          <FloatingAssistant />
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
