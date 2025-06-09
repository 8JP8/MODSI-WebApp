import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { checkAuth, validateToken, logout, isAuthenticated: authIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateAuthentication = async () => {
      setIsValidating(true);

      // First check local token validity
      if (!checkAuth()) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        navigate("/login", { replace: true });
        setIsValidating(false);
        return;
      }

      try {
        // Then validate with server - only if we have a token
        const isValid = await validateToken();
        
        if (!isValid) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          logout();
          navigate("/login", { replace: true });
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error validating token:", error);
        toast.error("Erro ao validar sessão. Por favor, faça login novamente.");
        logout();
        navigate("/login", { replace: true });
      } finally {
        setIsValidating(false);
      }
    };

    // Only validate if we think we should be authenticated
    if (authIsAuthenticated || localStorage.getItem("authToken")) {
      validateAuthentication();
    } else {
      // No token, redirect immediately
      navigate("/login", { replace: true });
      setIsValidating(false);
    }
  }, [checkAuth, validateToken, logout, navigate, authIsAuthenticated]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Validando sessão...</p>
        </div>
      </div>
    );
  }

  // Don't render children until we've verified auth
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;