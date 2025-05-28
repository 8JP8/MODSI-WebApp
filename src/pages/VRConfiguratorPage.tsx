
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VRDashboard from "@/components/vr-dashboard/VRDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

const VRConfiguratorPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    // Simple check - if no valid local token, redirect
    if (!checkAuth()) {
      navigate("/login", { replace: true });
    }
  }, [checkAuth, navigate]);

  return (
    <div className={isMobile ? "pb-16" : ""}>
      <VRDashboard />
    </div>
  );
};

export default VRConfiguratorPage;
