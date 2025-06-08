
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import ImportDialog from "./ImportDialog";

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
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleExport = () => {
    if (onExportCurrentConfig) {
      onExportCurrentConfig();
    } else {
      const dataStr = JSON.stringify(currentConfig, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `configuracao-graficos-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Configuração exportada!");
    }
  };

  const handleReset = () => {
    onResetConfig();
    toast.success("Configuração reinicializada!");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onLoadConfig={onLoadConfig}
      />
    </>
  );
};

export default ConfigurationManager;
