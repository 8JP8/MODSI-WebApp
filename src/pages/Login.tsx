
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Lock, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, checkAuth, checkEmail } = useAuth();

  useEffect(() => {
    // Check if token exists and is valid
    if (checkAuth()) {
      navigate("/configurator");
    }
  }, [navigate, checkAuth]);

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
      toast.error("A password deve ter pelo menos 5 caracteres e não conter comandos SQL");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-900/50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center vr-gradient-text">
              MODSI VR Visualização
            </CardTitle>
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
                  onChange={handleEmailChange}
                  className={`text-base p-4 ${
                    emailExists === true ? "border-green-500" : 
                    emailExists === false ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {emailExists === false && email.length > 5 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Email não registado no sistema
                    </AlertDescription>
                  </Alert>
                )}
                {emailExists === true && (
                  <Alert className="py-2 border-green-500 text-green-500">
                    <AlertDescription>
                      Email encontrado
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  placeholder="Palavra-passe"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-base p-4"
                  disabled={isLoading || emailExists === false}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full text-base py-5"
                disabled={isLoading || emailExists === false}
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
