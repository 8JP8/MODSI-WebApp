
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Layers, Settings, User, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-900/50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4 vr-gradient-text">
            MODSI VR
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma de visualização de dados empresariais em realidade virtual. 
            Analise KPIs e métricas de forma imersiva e interativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Visualization Hub */}
          <Card className="shadow-lg border border-slate-800 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Layers className="mr-2 h-5 w-5 text-primary" />
                Centro de Visualização
              </CardTitle>
              <CardDescription>
                Aceda a visualizações VR existentes ou crie novas experiências imersivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full text-base py-5" 
                onClick={() => navigate("/visualization-hub")}
              >
                <Zap className="mr-2 h-4 w-4" />
                Explorar Visualizações
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Dashboard */}
          <Card className="shadow-lg border border-slate-800 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Aceda ao painel de controlo para gerir dados e configurações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full text-base py-5"
                variant="outline" 
                onClick={() => navigate("/dashboard")}
              >
                <User className="mr-2 h-4 w-4" />
                Ir para Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Login */}
          <Card className="shadow-lg border border-slate-800 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Autenticação
              </CardTitle>
              <CardDescription>
                Entre no sistema para aceder ao configurador VR e funcionalidades avançadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full text-base py-5"
                variant="secondary" 
                onClick={() => navigate("/login")}
              >
                <User className="mr-2 h-4 w-4" />
                Fazer Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Desenvolvido para análise empresarial avançada em ambiente VR
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
