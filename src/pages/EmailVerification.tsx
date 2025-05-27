
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Loader2, Mail } from "lucide-react";

const EmailVerification = () => {
  const { code } = useParams<{ code: string }>();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  const [autoVerified, setAutoVerified] = useState(false);

  useEffect(() => {
    // If code is provided in URL, set it automatically and trigger verification
    if (code && !autoVerified) {
      setVerificationCode(code);
      handleVerification(code);
      setAutoVerified(true);
    }
  }, [code, autoVerified]);

  const handleVerification = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || verificationCode;
    
    if (!finalCode.trim()) {
      toast.error("Por favor, introduza o código de verificação");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api/User/VerifyUser?verificationcode=${encodeURIComponent(finalCode)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const responseText = await response.text();
      
      if (response.ok) {
        setVerificationStatus('success');
        setMessage("Utilizador verificado");
        toast.success("Conta verificada com sucesso!");
      } else {
        setVerificationStatus('error');
        setMessage("O código de verificação é inválido");
        toast.error("Código de verificação inválido");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus('error');
      setMessage("O código de verificação é inválido");
      toast.error("Erro na verificação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerification();
  };

  const handleGoToMainPage = () => {
    window.location.href = "https://modsivr.pt";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getStatusIcon = () => {
    if (verificationStatus === 'success') {
      return <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />;
    } else if (verificationStatus === 'error') {
      return <X className="h-12 w-12 text-red-500 mx-auto mb-4" />;
    }
    return <Mail className="h-12 w-12 text-primary mx-auto mb-4" />;
  };

  const getStatusMessage = () => {
    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
            {message}
          </p>
          <p className="text-muted-foreground mb-6">
            A sua conta foi verificada com sucesso! Pode agora utilizar todos os recursos da plataforma.
          </p>
        </div>
      );
    } else if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            {message}
          </p>
          <p className="text-muted-foreground mb-6">
            O código inserido não é válido ou já expirou. Contacte o suporte se o problema persistir.
          </p>
        </div>
      );
    }
    return null;
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
              <div className="flex-1 text-center">
                <CardTitle className="text-xl font-bold vr-gradient-text">
                  MODSiVR
                </CardTitle>
                <p className="text-lg font-semibold text-foreground">
                  Verificação de Email
                </p>
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            <CardDescription className="text-center">
              Introduza o código de verificação enviado para o seu email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              {getStatusIcon()}
            </div>

            {getStatusMessage()}

            {verificationStatus === 'idle' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="code"
                    placeholder="Código de verificação"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-base p-4"
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full text-base py-5"
                  disabled={isLoading || !verificationCode.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A verificar...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Verificar
                    </>
                  )}
                </Button>
              </form>
            )}

            {(verificationStatus === 'success' || verificationStatus === 'error') && (
              <div className="space-y-4">
                <Button 
                  onClick={handleGoToMainPage}
                  className="w-full text-base py-5"
                  variant={verificationStatus === 'success' ? 'default' : 'outline'}
                >
                  Página Principal
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full mt-2">
              {verificationStatus === 'idle' 
                ? "Introduza o código que recebeu por email para verificar a sua conta."
                : "Obrigado por utilizar a plataforma MODSiVR."
              }
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
