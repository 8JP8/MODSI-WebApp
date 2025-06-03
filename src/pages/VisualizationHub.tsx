
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Layers, User, ArrowLeft, Clock, Zap, Play, Trash2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { HelpButton } from "@/components/HelpButton";

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
    
    // Navigate to the room page instead of external URL
    navigate(`/room/${roomCode}`);
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
    navigate("/login");
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 dark:from-background dark:to-slate-900/50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl relative">
        {/* Header with back button and theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="h-10 w-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
          </button>
          
          <div className="flex items-center gap-3">
            <HelpButton />
            <ThemeToggle />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 vr-gradient-text min-h-[4rem] flex items-center justify-center">
            Plataforma de Visualização de Dados VR
          </h1>
          <p className="text-xl text-muted-foreground">
            Visualize e analise KPIs empresariais em realidade virtual
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Entrar na Visualização */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Play className="mr-2 h-5 w-5 text-primary transition-transform duration-200 hover:rotate-12" />
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
                  className="w-full text-base py-5 group" 
                  onClick={() => handleJoinVisualization()}
                >
                  <Zap className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  Entrar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Criar Visualização */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary transition-transform duration-200 hover:rotate-12" />
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
                  className="w-full text-base py-5 group" 
                  variant="outline"
                  onClick={navigateToConfigurator}
                >
                  <Layers className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  Abrir Configurador
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* As Minhas Visualizações */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5 text-primary transition-transform duration-200 hover:rotate-12" />
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
                          className="group"
                          onClick={() => handleJoinVisualization(code)}
                        >
                          <Play className="h-3 w-3 mr-1 transition-transform duration-200 group-hover:rotate-12" />
                          Entrar
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 group" 
                      onClick={clearVisualizationHistory}
                    >
                      <Trash2 className="h-3 w-3 mr-2 transition-transform duration-200 group-hover:rotate-12" />
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
            Plataforma de gestão e visualização de indicadores empresariais em VR para análise de dados internos complexos
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualizationHub;
