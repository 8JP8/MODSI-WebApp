
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check local token validity, no server validation
    if (!checkAuth()) {
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      navigate("/login", { replace: true });
    }
  }, [checkAuth, navigate]);

  // Don't render children until we've verified auth
  if (!checkAuth()) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
