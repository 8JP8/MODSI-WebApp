
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Layers, User, ArrowLeft, Clock } from "lucide-react";

const VisualizationHub = () => {
  const navigate = useNavigate();
  const [visualizationId, setVisualizationId] = useState("");
  const [visualizationHistory, setVisualizationHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load visualization history from localStorage
    try {
      const historyStr = localStorage.getItem("visualizationHistory");
      if (historyStr) {
        const history = JSON.parse(historyStr);
        setVisualizationHistory(Array.isArray(history) ? history : []);
      }
    } catch (error) {
      console.error("Error loading visualization history:", error);
    }
  }, []);

  const handleJoinVisualization = (code?: string) => {
    const roomCode = code || visualizationId;
    
    if (!roomCode.trim()) {
      toast.error("Por favor, insira um código de visualização.");
      return;
    }

    // Save to history
    saveVisualizationToHistory(roomCode);
    
    toast.success(`A entrar na visualização ${roomCode}`);
    navigate(`/configurator?room=${roomCode}`);
  };

  const saveVisualizationToHistory = (code: string) => {
    try {
      // Add to local state
      const updatedHistory = [code, ...visualizationHistory.filter(c => c !== code)].slice(0, 10);
      setVisualizationHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem("visualizationHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving visualization to history:", error);
    }
  };

  const navigateToConfigurator = () => {
    navigate("/configurator");
  };

  const handleBack = () => {
    navigate('/');
  };

  const clearVisualizationHistory = () => {
    localStorage.removeItem("visualizationHistory");
    setVisualizationHistory([]);
    toast.success("Histórico de visualizações limpo");
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
                  onClick={() => handleJoinVisualization()}
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
                Aceda às suas visualizações de dados VR recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visualizationHistory.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {visualizationHistory.map((code, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">{code}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleJoinVisualization(code)}
                        >
                          Entrar
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={clearVisualizationHistory}
                    >
                      Limpar Histórico
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Não tem visualizações recentes. Entre num código de visualização para o adicionar ao histórico.
                  </p>
                )}
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

export default VisualizationHub;
