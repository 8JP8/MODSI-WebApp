
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VRDashboard from "@/components/vr-dashboard/VRDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const VRConfiguratorPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { validateToken } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  
  useEffect(() => {
    const checkTokenValidity = async () => {
      console.log("Validating token on configurator page load...");
      
      try {
        const isValid = await validateToken();
        console.log("Token validation result:", isValid);
        
        if (!isValid) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          navigate("/login");
          return;
        }
        
        setIsValidating(false);
      } catch (error) {
        console.error("Error during token validation:", error);
        toast.error("Erro na validação da sessão. Por favor, faça login novamente.");
        navigate("/login");
      }
    };

    checkTokenValidity();
  }, [validateToken, navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">A validar sessão...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={isMobile ? "pb-16" : ""}>
      <VRDashboard />
    </div>
  );
};

export default VRConfiguratorPage;
