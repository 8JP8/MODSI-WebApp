
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkAuth()) {
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      navigate("/login");
    }
  }, [checkAuth, navigate]);

  return <>{children}</>;
};

export default RequireAuth;
