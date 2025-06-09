import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Lock, LogIn, Loader2, ArrowLeft, Check, User, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const navigate = useNavigate();
  const { login, checkAuth, checkEmail, requestPasswordReset } = useAuth();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only check auth once on component mount - simple local check
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      if (checkAuth()) {
        navigate("/configurator", { replace: true });
      }
    }
  }, [checkAuth, navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  }

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?!.*(?:--|;|\/\*|\*\/|xp_|union|select|insert|update|delete|drop|alter|create|truncate|exec|declare)).{5,}$/;
    return passwordRegex.test(password);
  }

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Reset email status when changed
    setEmailExists(null);
    
    // If email is valid and has at least 5 characters, check if it exists
    if (validateEmail(newEmail) && newEmail.length >= 5) {
      const exists = await checkEmail(newEmail);
      setEmailExists(exists);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Por favor, introduza um email válido");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("A password deve ter pelo menos 5 caracteres");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Force replace navigation to prevent back button issues
        navigate("/configurator", { replace: true });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if the error message contains the specific invalid credentials text
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("Invalid username/email or password")) {
        toast.error("Email ou password incorretos. Verifique as suas credenciais.");
      } else {
        toast.error("Erro no login. Por favor, tente novamente.");
      }
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

    if (emailExists === false) {
      toast.error("Email não registado no sistema");
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 dark:from-background dark:to-slate-900/50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-slate-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="p-2 h-auto group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:rotate-12" />
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
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`text-base p-4 pl-10 ${
                      emailExists === true ? "border-green-500" : 
                      emailExists === false ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {emailExists === false && email.length > 5 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      ✕ Email não registado no sistema
                    </AlertDescription>
                  </Alert>
                )}
                {emailExists === true && (
                  <Alert className="py-2 border-green-500 text-green-500">
                    <AlertDescription>
                      ✓ Email encontrado
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    placeholder="Palavra-passe"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-base p-4 pl-10"
                    disabled={isLoading || emailExists === false}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full text-base py-5 group"
                disabled={isLoading || emailExists === false}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4 group-hover:rotate-12" />
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
                disabled={!email.trim() || !validateEmail(email) || emailExists === false || isRequestingReset}
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

export default Login
