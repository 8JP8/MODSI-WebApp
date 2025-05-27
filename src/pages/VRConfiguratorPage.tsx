
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VRDashboard from "@/components/vr-dashboard/VRDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const VRConfiguratorPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { validateToken, checkAuth } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);
  
  useEffect(() => {
    const checkTokenValidity = async () => {
      // Prevent multiple validation calls
      if (hasValidated) {
        return;
      }
      
      console.log("Validating token on configurator page load...");
      
      try {
        // First check if there's a token in localStorage
        const hasToken = checkAuth();
        
        if (!hasToken) {
          console.log("No auth token found, redirecting to login");
          toast.error("Por favor, faça login para aceder ao configurador.");
          navigate("/login");
          return;
        }
        
        // If token exists, validate it with the server
        const isValid = await validateToken();
        console.log("Token validation result:", isValid);
        
        if (!isValid) {
          console.log("Token is invalid, redirecting to login");
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          navigate("/login");
          return;
        }
        
        console.log("Token is valid, allowing access to configurator");
        setHasValidated(true);
        setIsValidating(false);
      } catch (error) {
        console.error("Error during token validation:", error);
        toast.error("Erro na validação da sessão. Por favor, faça login novamente.");
        navigate("/login");
      }
    };

    checkTokenValidity();
  }, [validateToken, navigate, checkAuth, hasValidated]);

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
