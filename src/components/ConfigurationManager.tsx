import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Trash2, RefreshCw, FileDown, FileUp } from "lucide-react";

interface ConfigurationSettings {
  chartType: string;
  xAxis: string;
  yAxis: string;
  zAxis?: string;
  position: {
    x: number;
    y: number;
    z: number;
    scale: number;
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
  onSaveConfig?: () => void;
}

const ConfigurationManager = ({
  currentConfig,
  onLoadConfig,
  onResetConfig,
  onSaveConfig,
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
        console.error("Error loading saved configurations", e);
      }
    }
  }, []);

  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      toast.error("Please enter a configuration name");
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
      toast.success(`Configuration "${configName}" saved`);
      setConfigName("");
      if (onSaveConfig) {
        onSaveConfig();
      }
    } catch (e) {
      toast.error("Error saving configuration");
      console.error("Error saving configuration", e);
    }
  };

  const loadConfig = (config: ConfigurationSettings) => {
    onLoadConfig(config);
    toast.success("Configuration loaded");
    if (onSaveConfig) {
      onSaveConfig();
    }
  };

  const deleteConfig = (name: string) => {
    const newConfigs = savedConfigs.filter((c) => c.name !== name);
    setSavedConfigs(newConfigs);
    
    try {
      localStorage.setItem("vrDataConfigs", JSON.stringify(newConfigs));
      toast.success(`Configuration "${name}" deleted`);
    } catch (e) {
      toast.error("Error deleting configuration");
    }
  };

  const exportAllConfigs = () => {
    const dataStr = JSON.stringify(savedConfigs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `vr-data-configs-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success("Exported all configurations");
    if (onSaveConfig) {
      onSaveConfig();
    }
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
          toast.success(`Imported ${imported.length} configurations`);
          if (onSaveConfig) {
            onSaveConfig();
          }
        } else {
          toast.error("Invalid import file format");
        }
      } catch (e) {
        toast.error("Error importing configurations");
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Configuration name"
              className="flex-1"
            />
            <Button variant="outline" onClick={saveCurrentConfig}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onResetConfig}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportAllConfigs}>
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="relative">
                <Button variant="outline" className="relative">
                  <FileUp className="w-4 h-4 mr-2" />
                  Import
                  <input
                    type="file"
                    onChange={importConfigs}
                    accept=".json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
              </div>
            </div>
          </div>

          {savedConfigs.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Saved Configurations</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedConfigs.map((saved, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-secondary p-2"
                  >
                    <span className="truncate max-w-[180px]">{saved.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadConfig(saved.config)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
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
