
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import VisualizationHub from "./pages/VisualizationHub";
import VisualizationLanding from "./pages/VisualizationLanding";
import VRConfiguratorPage from "./pages/VRConfiguratorPage";
import VRRoom from "./pages/VRRoom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import { AuthProvider } from "./hooks/useAuth";
import RequireAuth from "./components/RequireAuth";
import EmailVerification from "./pages/EmailVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/visualization-hub" element={<VisualizationHub />} />
              <Route path="/configurator" element={
                <RequireAuth>
                  <VRConfiguratorPage />
                </RequireAuth>
              } />
              <Route path="/room/:roomCode" element={<VRRoom />} />
              <Route path="/login" element={<Login />} />
              <Route path="/passwordreset" element={<PasswordReset />} />
              <Route path="/passwordreset/:code" element={<PasswordReset />} />
              <Route path="/emailverification" element={<EmailVerification />} />
              <Route path="/emailverification/:code" element={<EmailVerification />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
