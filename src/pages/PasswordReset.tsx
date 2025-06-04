
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PasswordReset = () => {
  const { code } = useParams<{ code: string }>();
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  useEffect(() => {
    // If code is provided in URL, set it automatically
    if (code) {
      setResetCode(code);
    }
  }, [code]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?!.*(?:--|;|\/\*|\*\/|xp_|union|select|insert|update|delete|drop|alter|create|truncate|exec|declare)).{5,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetCode.trim()) {
      toast.error("Por favor, introduza o código de recuperação");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("A password deve ter pelo menos 5 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As passwords não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await resetPassword(resetCode, password);
      
      if (success) {
        // Check if user came from another site or redirect to login
        const referrer = document.referrer;
        if (referrer && !referrer.includes(window.location.origin)) {
          navigate("/");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Erro ao alterar password. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
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
                className="p-2 h-auto group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:rotate-12" />
              </Button>
              <div className="flex-1 text-center">
                <CardTitle className="text-xl font-bold vr-gradient-text">
                  MODSiVR
                </CardTitle>
                <p className="text-lg font-semibold text-foreground">
                  Alterar Password
                </p>
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            <CardDescription className="text-center">
              Introduza o código de recuperação e a sua nova password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="code"
                  placeholder="Código de recuperação"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="text-base p-4"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Nova palavra-passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-base p-4 pr-12"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    placeholder="Confirmar palavra-passe"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-base p-4 pr-12"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full text-base py-5"
                disabled={isLoading || !resetCode.trim() || !password || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A alterar...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Alterar Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full mt-2">
              Introduza o código que recebeu por email para alterar a sua password.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
