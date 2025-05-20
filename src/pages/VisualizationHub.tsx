import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Layers, User, ArrowLeft } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [visualizationId, setVisualizationId] = useState("");

  const handleJoinVisualization = () => {
    if (!visualizationId.trim()) {
      toast.error("Por favor, insira um código de visualização.");
      return;
    }

    toast.success(`A entrar na visualização ${visualizationId}`);
    navigate(`/configurator?room=${visualizationId}`);
  };

  const navigateToConfigurator = () => {
    navigate("/configurator");
  };

  const navigateToUserVisualizations = () => {
    window.open("https://modsivr.pt", "_blank");
  };

  const handleBack = () => {
    navigate('/');
    //navigate(-1); // Voltar à página anterior
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-900/50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl relative">
        {/* Botão Voltar */}
        <button
          onClick={handleBack}
          className="absolute top-0 left-0 h-10 w-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 vr-gradient-text">
            Plataforma de Visualização de Dados VR
          </h1>
          <p className="text-xl text-muted-foreground">
            Crie, partilhe e explore dados em realidade virtual
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Entrar na Visualização */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Layers className="mr-2 h-5 w-5 text-primary" />
                Entrar na Visualização
              </CardTitle>
              <CardDescription>
                Insira um código para entrar numa experiência VR existente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Insira o código de visualização"
                  value={visualizationId}
                  onChange={(e) => setVisualizationId(e.target.value)}
                  className="text-base p-4"
                />
                <Button 
                  className="w-full text-base py-5" 
                  onClick={handleJoinVisualization}
                >
                  Entrar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Criar Visualização */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Editor de Visualizações
              </CardTitle>
              <CardDescription>
                Crie e personalize as suas experiências VR de visualização de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Projete visualizações interativas com múltiplos tipos de gráficos, 
                  controlo de posições e definições avançadas.
                </p>
                <Button 
                  className="w-full text-base py-5" 
                  variant="outline"
                  onClick={navigateToConfigurator}
                >
                  Abrir Configurador
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* As Minhas Visualizações */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                As Minhas Visualizações
              </CardTitle>
              <CardDescription>
                Aceda às suas visualizações de dados VR guardadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Visualize, gere e partilhe as suas experiências de visualização de dados.
                </p>
                <Button 
                  className="w-full text-base py-5" 
                  variant="outline"
                  onClick={navigateToUserVisualizations}
                >
                  Ver Minhas Visualizações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Desenvolvido com A-Frame e BabiaXR para experiências imersivas de visualização de dados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;