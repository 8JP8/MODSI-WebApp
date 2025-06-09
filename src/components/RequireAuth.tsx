import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { checkAuth, validateToken, logout } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const validateAuthentication = async () => {
      // Prevent multiple validations
      if (hasRedirected) return;
      
      setIsValidating(true);

      try {
        // First check if we have a valid local token
        const hasValidLocalToken = checkAuth();
        
        if (!hasValidLocalToken) {
          console.log('No valid local token found, redirecting to login');
          setHasRedirected(true);
          navigate("/login", { replace: true });
          return;
        }

        // If we have a local token, validate it with the server
        console.log('Local token found, validating with server...');
        const isServerValid = await validateToken();
        
        if (!isServerValid) {
          console.log('Server validation failed, redirecting to login');
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          logout();
          setHasRedirected(true);
          navigate("/login", { replace: true });
          return;
        }

        console.log('Authentication successful');
        setIsAuthenticated(true);
        
      } catch (error) {
        console.error("Error during authentication validation:", error);
        toast.error("Erro ao validar sessão. Por favor, faça login novamente.");
        logout();
        setHasRedirected(true);
        navigate("/login", { replace: true });
      } finally {
        setIsValidating(false);
      }
    };

    validateAuthentication();
  }, [checkAuth, validateToken, logout, navigate, hasRedirected]);

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
  if (!isAuthenticated || hasRedirected) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;