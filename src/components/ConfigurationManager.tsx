
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Trash2, RefreshCw, FileDown, FileUp, Download } from "lucide-react";

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

  useEffect(() => {
    // Load saved configurations from localStorage
    const savedConfigsStr = localStorage.getItem("vrDataConfigs");
    if (savedConfigsStr) {
      try {
        const parsed = JSON.parse(savedConfigsStr);
        setSavedConfigs(parsed);
      } catch (e) {
        console.error("Erro ao carregar configurações guardadas", e);
      }
    }
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
<<<<<<< HEAD
            <Button onClick={saveCurrentConfig} size="sm" className="w-full text-base py-5">
              <Save className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-12" />
=======
            <Button onClick={saveCurrentConfig} size="sm">
              <Save className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
>>>>>>> 9205f1f7a9449510a18bbd811906052fea4b4ddb
              Guardar
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
<<<<<<< HEAD
            <Button variant="outline" onClick={onResetConfig} className="w-full text-base py-5">
              <RefreshCw className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-12" />
              Repor
            </Button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" onClick={handleExportCurrent} className="w-full text-base py-5">
                <Download className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-12" />
                Exportar Configuração Atual
              </Button>
              <Button variant="outline" onClick={exportAllConfigs} className="w-full text-base py-5">
                <FileDown className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-12" />
                Exportar Todas
              </Button>
              <div className="relative w-full sm:w-auto">
                <Button variant="outline" className="w-full text-base py-5">
                  <FileUp className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-12" />
                  Importar
                  <input
                    type="file"
                    onChange={importConfigs}
                    accept=".json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
              </div>
=======
            <Button variant="outline" onClick={onResetConfig} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
              Repor
            </Button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" onClick={handleExportCurrent} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                Exportar Configuração Atual
              </Button>
              <Button variant="outline" onClick={exportAllConfigs} className="w-full sm:w-auto">
                <FileDown className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                Exportar Todas
              </Button>
              <Button variant="outline" className="relative w-full sm:w-auto" cursor="hand">
                <FileUp className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                Importar
                <input
                  type="file"
                  onChange={importConfigs}
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-hand"
                />
              </Button>
>>>>>>> 9205f1f7a9449510a18bbd811906052fea4b4ddb
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
                    <div className="flex flex-row gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadConfig(saved.config)}
                        className="flex-1 sm:flex-initial"
                      >
                        Carregar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadConfig(saved)}
                        className="flex-1 sm:flex-initial"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 flex-1 sm:flex-initial"
                        onClick={() => deleteConfig(saved.name)}
                      >
                        <Trash2 className="w-4 h-4" />
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
