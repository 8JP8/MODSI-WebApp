import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileUp, Upload, Database, FileJson, HardDriveUpload} from "lucide-react";

interface ImportConfigModalProps {
  onImport: (config: any) => void;
  onConfigSaved?: () => void;
}

const ImportConfigModal = ({ onImport, onConfigSaved }: ImportConfigModalProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const saveConfigToLocalStorage = (config: any, name: string) => {
    try {
      const savedConfigsStr = localStorage.getItem("vrDataConfigs");
      const savedConfigs = savedConfigsStr ? JSON.parse(savedConfigsStr) : [];
      
      const newConfig = {
        name: name,
        config: config,
      };

      const newConfigs = [...savedConfigs.filter((c: any) => c.name !== name), newConfig];
      localStorage.setItem("vrDataConfigs", JSON.stringify(newConfigs));
      
      console.log(`Configuration "${name}" saved to localStorage`);
      
      // Trigger refresh callback
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error("Error saving configuration to localStorage:", error);
    }
  };

  const handleDatabaseImport = async () => {
    if (!roomCode.trim()) {
      toast.error("Por favor, introduza um código de sala");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api/Room/Get/${roomCode}?code=z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==`
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);
      
      // Handle the actual API response format
      let config;
      let configName = "Configuração Importada";
      
      if (data.JsonData) {
        // Parse JsonData if it's a string
        if (typeof data.JsonData === 'string') {
          config = JSON.parse(data.JsonData);
        } else {
          config = data.JsonData;
        }
      } else if (data.configuration) {
        // Handle old format with 'configuration' property
        if (typeof data.configuration === 'string') {
          config = JSON.parse(data.configuration);
        } else {
          config = data.configuration;
        }
      } else {
        // Direct configuration data
        config = data;
      }

      console.log("Processed config:", config);

      // The API returns an array format, so we need to handle that
      let configurationData;
      if (Array.isArray(config) && config.length > 0 && config[0].config) {
        // Extract the actual configuration from the array format
        configurationData = config[0].config;
        // Get the name from the first item in the array
        if (config[0].name) {
          configName = `${config[0].name} - ${roomCode}`;
        } else {
          configName = `Configuração Base de Dados - ${roomCode}`;
        }
      } else if (config.config) {
        // Single configuration object
        configurationData = config.config;
        if (config.name) {
          configName = `${config.name} - ${roomCode}`;
        } else {
          configName = `Configuração Base de Dados - ${roomCode}`;
        }
      } else if (config.charts && config.kpihistory) {
        // Direct format without wrapper
        configurationData = config;
        configName = `Configuração Base de Dados - ${roomCode}`;
      } else {
        console.error("Unexpected configuration format:", config);
        throw new Error("Formato de configuração não reconhecido");
      }

      // Save to localStorage with the generated name
      saveConfigToLocalStorage(configurationData, configName);
      
      onImport(configurationData);

      // toast.success("Configuração importada da base de dados com sucesso");
      setOpen(false);
      setRoomCode("");
    } catch (error) {
      console.error("Erro ao importar da base de dados:", error);
      toast.error("Erro ao importar configuração da base de dados");
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        // Use the filename as the configuration name
        const configName = file.name.replace('.json', '');
        
        // Save to localStorage with the filename
        saveConfigToLocalStorage(imported, configName);
        
        onImport(imported);
        // toast.success("Configuração importada do ficheiro com sucesso");
        setOpen(false);
      } catch (error) {
        toast.error("Erro ao importar configuração do ficheiro");
        console.error("Erro ao importar ficheiro:", error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="group flex-shrink-0">
          <FileUp className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar Configuração</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database" className="group">
              <Database className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 group-hover:rotate-12" />
              Base de Dados
              </TabsTrigger>
            <TabsTrigger value="file" className="group">
              <FileJson className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 group-hover:rotate-12" />
              Ficheiro JSON
              </TabsTrigger>
          </TabsList>
          
          <TabsContent value="database" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código da Sala</label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Introduza o código da sala (ex: ABCDE)"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleDatabaseImport} 
              disabled={loading || !roomCode.trim()}
              className="w-full group"
            >
              <HardDriveUpload className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 group-hover:rotate-12" />
              {loading ? "A importar..." : "Importar da Base de Dados"}
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Ficheiro JSON</label>
              <div className="relative">
                <Button variant="outline" className="w-full relative group">
                  <Upload className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  Escolher Ficheiro
                  <input
                    type="file"
                    onChange={handleFileImport}
                    accept=".json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione um ficheiro JSON com a configuração exportada anteriormente.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportConfigModal;
