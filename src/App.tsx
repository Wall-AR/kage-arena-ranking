import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Ranking from "./pages/Ranking";
import Challenges from "./pages/Challenges";
import Profile from "./pages/Profile";
import Tournaments from "./pages/Tournaments";
import Forum from "./pages/Forum";
import Training from "./pages/Training";
import Auth from "./pages/Auth";
import Evaluations from "./pages/Evaluations";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:playerId" element={<Profile />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/training" element={<Training />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
