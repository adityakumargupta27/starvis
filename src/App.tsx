
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import BottomNav from "@/components/BottomNav";
import { Sidebar } from "@/components/ui/sidebar";
import Dashboard from "./pages/Dashboard";
import VoiceAssistant from "./pages/VoiceAssistant";
import StudyAnalytics from "./pages/StudyAnalytics";
import Assignments from "./pages/Assignments";
import NotFound from "./pages/NotFound";
import FloatingAssistant from "./components/FloatingAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1">
              <div className="absolute top-4 right-4 z-50">
                <ModeToggle />
              </div>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/voice" element={<VoiceAssistant />} />
                <Route path="/analytics" element={<StudyAnalytics />} />
                <Route path="/assignments" element={<Assignments />} />
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
