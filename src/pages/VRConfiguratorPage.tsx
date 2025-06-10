import VRDashboard from "@/components/vr-dashboard/VRDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VRConfiguratorPage = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className={isMobile ? "pb-16" : ""}>
      <VRDashboard />
    </div>
  );
};

export default VRConfiguratorPage;