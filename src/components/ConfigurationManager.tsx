
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  RefreshCw, 
  Download, 
  FileDown, 
  Upload, 
  Save,
  Trash2
} from "lucide-react";

interface ConfigurationManagerProps {
  currentConfig: any;
  onLoadConfig: (config: any) => void;
  onResetConfig: () => void;
  onExportCurrentConfig?: () => void;
}

const ConfigurationManager = ({
  currentConfig,
  onLoadConfig,
  onResetConfig,
  onExportCurrentConfig
}: ConfigurationManagerProps) => {
  const [configName, setConfigName] = useState("");

  const handleSaveConfig = () => {
    if (!configName.trim()) {
      toast.error("Por favor, introduza um nome para a configuração");
      return;
    }

    try {
      const savedConfigs = JSON.parse(localStorage.getItem('vr-configurations') || '{}');
      savedConfigs[configName] = currentConfig;
      localStorage.setItem('vr-configurations', JSON.stringify(savedConfigs));
      
      toast.success(`Configuração "${configName}" guardada com sucesso`);
      setConfigName("");
    } catch (error) {
      toast.error("Erro ao guardar configuração");
      console.error("Error saving configuration:", error);
    }
  };

  const handleExportAll = () => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('vr-configurations') || '{}');
      const dataStr = JSON.stringify(savedConfigs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vr-configurations-all.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Todas as configurações exportadas com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar configurações");
      console.error("Error exporting configurations:", error);
    }
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);
        onLoadConfig(configData);
        toast.success("Configuração importada com sucesso");
      } catch (error) {
        toast.error("Erro ao importar configuração - ficheiro inválido");
        console.error("Error importing configuration:", error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader>
        <CardTitle>Gestão de Configurações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="config-name">Nome da configuração</Label>
          <div className="flex gap-2">
            <Input
              id="config-name"
              placeholder="Nome da configuração"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
            />
            <Button onClick={handleSaveConfig} size="sm">
              <Save className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-12" />
              Guardar
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onResetConfig} size="sm">
            <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-180" />
            Repor
          </Button>
          
          <Button variant="outline" onClick={onExportCurrentConfig} size="sm">
            <Download className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-12" />
            Exportar Configuração Atual
          </Button>
          
          <Button variant="outline" onClick={handleExportAll} size="sm">
            <FileDown className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-12" />
            Exportar Todas
          </Button>
          
          <Button variant="outline" size="sm" className="relative overflow-hidden">
            <Upload className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-12" />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationManager;
