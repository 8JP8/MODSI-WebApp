import { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { validateToken, logout } = useAuth();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const hasValidated = useRef(false);
  const isNavigating = useRef(false);

  useEffect(() => {
    // Prevent multiple validations
    if (hasValidated.current || isNavigating.current) return;

    const validateAuthentication = async () => {
      try {
        hasValidated.current = true;
        
        // Simple local token check first
        const tokenData = localStorage.getItem("authToken");
        
        if (!tokenData) {
          console.log('No token found, redirecting to login');
          setAuthState('unauthenticated');
          isNavigating.current = true;
          navigate("/login", { replace: true });
          return;
        }

        // Parse and check expiry locally
        try {
          const parsedToken = JSON.parse(tokenData);
          if (!parsedToken.token || !parsedToken.expiry) {
            console.log('Invalid token format, redirecting to login');
            localStorage.removeItem("authToken");
            setAuthState('unauthenticated');
            isNavigating.current = true;
            navigate("/login", { replace: true });
            return;
          }

          // Check local expiry
          if (new Date().getTime() >= parsedToken.expiry) {
            console.log('Token expired locally, redirecting to login');
            localStorage.removeItem("authToken");
            setAuthState('unauthenticated');
            isNavigating.current = true;
            navigate("/login", { replace: true });
            return;
          }

          // Token exists and is not expired locally, validate with server
          console.log('Token found, validating with server...');
          const isValid = await validateToken();
          
          if (!isValid) {
            console.log('Server validation failed, redirecting to login');
            toast.error("Sessão expirada. Por favor, faça login novamente.");
            logout();
            setAuthState('unauthenticated');
            isNavigating.current = true;
            navigate("/login", { replace: true });
            return;
          }

          console.log('Authentication successful');
          setAuthState('authenticated');
          
        } catch (parseError) {
          console.error('Error parsing token:', parseError);
          localStorage.removeItem("authToken");
          setAuthState('unauthenticated');
          isNavigating.current = true;
          navigate("/login", { replace: true });
        }

      } catch (error) {
        console.error("Error during authentication validation:", error);
        toast.error("Erro ao validar sessão. Por favor, faça login novamente.");
        logout();
        setAuthState('unauthenticated');
        isNavigating.current = true;
        navigate("/login", { replace: true });
      }
    };

    validateAuthentication();
  }, []); // Empty dependency array to run only once

  // Show loading while checking authentication
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Validando sessão...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if unauthenticated (redirect should have happened)
  if (authState === 'unauthenticated') {
    return null;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default RequireAuth;