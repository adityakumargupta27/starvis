import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import VoiceAssistant from "./pages/VoiceAssistant";
import StudyAnalytics from "./pages/StudyAnalytics";
import Assignments from "./pages/Assignments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="mx-auto max-w-md min-h-screen relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/analytics" element={<StudyAnalytics />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
