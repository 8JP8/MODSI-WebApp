
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogIn, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const navigate = useNavigate();
  const { login, requestPasswordReset } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  }

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?!.*(?:--|;|\/\*|\*\/|xp_|union|select|insert|update|delete|drop|alter|create|truncate|exec|declare)).{5,}$/;
    return passwordRegex.test(password);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Por favor, introduza um email válido");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("Deve inserir uma password válida com pelo menos 5 caracteres");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate("/configurator");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro no login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Por favor, introduza o seu email primeiro");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Por favor, introduza um email válido");
      return;
    }

    setIsRequestingReset(true);
    
    try {
      await requestPasswordReset(email);
    } catch (error) {
      console.error("Password reset request error:", error);
    } finally {
      setIsRequestingReset(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-900/50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-slate-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="p-2 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold text-center vr-gradient-text flex-1">
                MODSiVR - Autenticação
              </CardTitle>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            <CardDescription className="text-center">
              Entre com as suas credenciais para aceder ao configurador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-base p-4"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  placeholder="Palavra-passe"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-base p-4"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full text-base py-5"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
            
            {/* Forgot Password Button */}
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-sm text-primary hover:text-primary/80 transition-colors p-0 h-auto font-normal"
                onClick={handleForgotPassword}
                disabled={!email.trim() || !validateEmail(email) || isRequestingReset}
              >
                {isRequestingReset ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  "Esqueci-me da password"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full mt-2">
              Este sistema requer autenticação para aceder ao configurador VR.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
