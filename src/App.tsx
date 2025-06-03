
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
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
import React from 'react';

const queryClient = new QueryClient();

const App = () => {
  // Handle GitHub Pages routing
  React.useEffect(() => {
    const search = window.location.search;
    if (search.includes('/?/')) {
      // GitHub Pages SPA routing detected
      const newPath = search.replace('/?/', '/').replace(/&/g, '?');
      console.log('GitHub Pages routing detected, redirecting to:', newPath);
      window.history.replaceState(null, '', newPath + window.location.hash);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
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
              <PWAInstallPrompt />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
