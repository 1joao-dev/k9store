import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import TradeLog from "./pages/TradeLog";
import Sessions from "./pages/Sessions";
import Statistics from "./pages/Statistics";
import BankControl from "./pages/BankControl";
import Strategies from "./pages/Strategies";
import GestionCalculator from "./pages/GestionCalculator";
import ExportData from "./pages/ExportData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<TradeLog />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/bank" element={<BankControl />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/calculator" element={<GestionCalculator />} />
            <Route path="/export" element={<ExportData />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
