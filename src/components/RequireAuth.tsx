import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, isInitialized, validateToken, logout } = useAuth();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    const validateAuthentication = async () => {
      try {
        console.log('RequireAuth: Starting authentication check...');
        
        // Wait for auth context to be initialized
        if (!isInitialized) {
          console.log('RequireAuth: Auth context not initialized yet, waiting...');
          return;
        }

        // If auth context says we're authenticated, trust it initially
        if (isAuthenticated) {
          console.log('RequireAuth: Auth context indicates user is authenticated');
          setAuthState('authenticated');
          return;
        }

        console.log('RequireAuth: User not authenticated, redirecting to login');
        setAuthState('unauthenticated');
        navigate("/login", { replace: true });
        
      } catch (error) {
        console.error("RequireAuth: Error during authentication validation:", error);
        toast.error("Erro ao validar sessão. Por favor, faça login novamente.");
        logout();
        setAuthState('unauthenticated');
        navigate("/login", { replace: true });
      }
    };

    validateAuthentication();
  }, [isAuthenticated, isInitialized, logout, navigate]);

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