
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, LogIn } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists and is valid
    const tokenData = localStorage.getItem("authToken");
    if (tokenData) {
      const { expiry } = JSON.parse(tokenData);
      if (new Date().getTime() < expiry) {
        navigate("/configurator");
      } else {
        // Token expired, remove it
        localStorage.removeItem("authToken");
      }
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username.trim() || !password.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // In a real app, you would validate against a backend
    // This is just a mock authentication
    if (username === "admin" && password === "admin") {
      // Create token with 1 hour expiry
      const expiry = new Date().getTime() + 60 * 60 * 1000; // 1 hour
      const tokenData = JSON.stringify({
        token: "mock-jwt-token",
        expiry,
        username
      });
      
      localStorage.setItem("authToken", tokenData);
      toast.success("Login efetuado com sucesso");
      navigate("/configurator");
    } else {
      toast.error("Credenciais inválidas");
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
                  id="username"
                  placeholder="Nome de utilizador"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-base p-4"
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
                />
              </div>
              <Button type="submit" className="w-full text-base py-5">
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Utilize username: admin, password: admin para entrar
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
