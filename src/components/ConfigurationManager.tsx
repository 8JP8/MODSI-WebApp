import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Trash2, RefreshCw, FileDown, Upload, Download } from "lucide-react";
import ImportConfigModal from "./ImportConfigModal";

interface Chart {
  id: string;
  chartType: string;
  position: any;
  xAxis: string;
  yAxis: string;
  zAxis: string;
  department: string;
  color: string;
}

interface ConfigurationSettings {
  charts?: Chart[];
  activeChartId?: string;
  chartType?: string;
  xAxis?: string;
  yAxis?: string;
  zAxis?: string;
  position?: {
    x: number;
    y: number;
    z: number;
    scale: number;
    width?: number;
    height?: number;
    depth?: number;
    rotation: {
      x: number;
      y: number;
      z: number;
    };
  };
}

interface ConfigurationManagerProps {
  currentConfig: ConfigurationSettings;
  onLoadConfig: (config: ConfigurationSettings) => void;
  onResetConfig: () => void;
  onExportCurrentConfig?: () => void;
}

const ConfigurationManager = ({
  currentConfig,
  onLoadConfig,
  onResetConfig,
  onExportCurrentConfig,
}: ConfigurationManagerProps) => {
  const [savedConfigs, setSavedConfigs] = useState<{ name: string; config: ConfigurationSettings }[]>([]);
  const [configName, setConfigName] = useState("");

  const loadSavedConfigs = () => {
    const savedConfigsStr = localStorage.getItem("vrDataConfigs");
    if (savedConfigsStr) {
      try {
        const parsed = JSON.parse(savedConfigsStr);
        setSavedConfigs(parsed);
      } catch (e) {
        console.error("Erro ao carregar configurações guardadas", e);
      }
    }
  };

  useEffect(() => {
    loadSavedConfigs();
  }, []);

  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      toast.error("Por favor, introduza um nome para a configuração");
      return;
    }

    const newConfig = {
      name: configName,
      config: { ...currentConfig },
    };

    const newConfigs = [...savedConfigs.filter(c => c.name !== configName), newConfig];
    setSavedConfigs(newConfigs);
    
    try {
      localStorage.setItem("vrDataConfigs", JSON.stringify(newConfigs));
      toast.success(`Configuração "${configName}" guardada`);
      setConfigName("");
    } catch (e) {
      toast.error("Erro ao guardar configuração");
      console.error("Erro ao guardar configuração", e);
    }
  };

  const loadConfig = (config: ConfigurationSettings) => {
    onLoadConfig(config);
    toast.success("Configuração carregada");
  };

  const deleteConfig = (name: string) => {
    const newConfigs = savedConfigs.filter((c) => c.name !== name);
    setSavedConfigs(newConfigs);
    
    try {
      localStorage.setItem("vrDataConfigs", JSON.stringify(newConfigs));
      toast.success(`Configuração "${name}" eliminada`);
    } catch (e) {
      toast.error("Erro ao eliminar configuração");
    }
  };

  const downloadConfig = (config: { name: string; config: ConfigurationSettings }) => {
    const dataStr = JSON.stringify([{
      name: config.name,
      config: config.config
    }], null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const sanitizedName = config.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const exportFileDefaultName = `configuracao-${sanitizedName}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success(`Configuração "${config.name}" exportada`);
  };

  const exportAllConfigs = () => {
    if (savedConfigs.length === 0) {
      toast.error("Não há configurações para exportar");
      return;
    }

    const dataStr = JSON.stringify(savedConfigs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `todas-configuracoes-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success("Exportadas todas as configurações");
  };

  const handleImportConfig = (config: any) => {
    onLoadConfig(config);
    toast.success("Configuração importada com sucesso");
  };

  const handleConfigSaved = () => {
    // Refresh the saved configurations list
    loadSavedConfigs();
  };

  const importConfigs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setSavedConfigs([...savedConfigs, ...imported]);
          localStorage.setItem(
            "vrDataConfigs",
            JSON.stringify([...savedConfigs, ...imported])
          );
          toast.success(`Importadas ${imported.length} configurações`);
        } else {
          toast.error("Formato de ficheiro inválido");
        }
      } catch (e) {
        toast.error("Erro ao importar configurações");
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = "";
  };

  const handleExportCurrent = () => {
    if (onExportCurrentConfig) {
      onExportCurrentConfig();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Configurações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Nome da configuração"
              className="flex-1"
            />
            <Button onClick={saveCurrentConfig} size="sm" className="w-full sm:w-auto group">
              <Save className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
              <span className="truncate">Guardar</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="outline" onClick={onResetConfig} className="group flex-shrink-0">
              <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              <span className="truncate">Repor</span>
            </Button>
            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
              <Button variant="outline" onClick={handleExportCurrent} className="group flex-shrink-0">
                <Download className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                <span className="hidden sm:inline truncate">Exportar Atual</span>
                <span className="sm:hidden truncate">Exportar</span>
              </Button>
              <Button variant="outline" onClick={exportAllConfigs} className="group flex-shrink-0">
                <FileDown className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                <span className="hidden sm:inline truncate">Exportar Todas</span>
                <span className="sm:hidden truncate">Todas</span>
              </Button>
              <ImportConfigModal onImport={handleImportConfig} onConfigSaved={handleConfigSaved} />
            </div>
          </div>

          {savedConfigs.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Configurações Guardadas</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedConfigs.map((saved, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-md bg-secondary p-3 gap-2"
                  >
                    <span className="truncate flex-1 text-sm">{saved.name}</span>
                    <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadConfig(saved.config)}
                        className="group flex-shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform duration-200"/>
                        <span className="text-xs truncate">Carregar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadConfig(saved)}
                        className="group flex-shrink-0"
                      >
                        <Download className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"/>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 group flex-shrink-0"
                        onClick={() => deleteConfig(saved.name)}
                      >
                        <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"/>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationManager;
