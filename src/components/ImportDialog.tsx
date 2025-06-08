
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadConfig: (config: any) => void;
}

const ImportDialog = ({ open, onOpenChange, onLoadConfig }: ImportDialogProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDatabaseImport = async () => {
    if (!roomCode.trim()) {
      toast.error("Por favor, introduza um código de visualização");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/room/${roomCode}`);
      
      if (!response.ok) {
        throw new Error("Visualização não encontrada");
      }
      
      const data = await response.json();
      
      if (data.configuration) {
        onLoadConfig(data.configuration);
        toast.success("Configuração importada com sucesso!");
        onOpenChange(false);
        setRoomCode("");
      } else {
        toast.error("Configuração não encontrada na visualização");
      }
    } catch (error) {
      console.error("Error importing from database:", error);
      toast.error("Erro ao importar da base de dados");
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string);
            onLoadConfig(config);
            toast.success("Configuração importada do ficheiro!");
            onOpenChange(false);
          } catch (error) {
            toast.error("Erro ao ler o ficheiro JSON");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Configuração</DialogTitle>
          <DialogDescription>
            Escolha como pretende importar a sua configuração
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Importar da Base de Dados
              </CardTitle>
              <CardDescription>
                Importe uma configuração usando o código de uma visualização existente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-code">Código da Visualização</Label>
                <Input
                  id="room-code"
                  placeholder="Introduza o código da visualização"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleDatabaseImport} 
                disabled={loading || !roomCode.trim()}
                className="w-full"
              >
                {loading ? "A importar..." : "Importar da Base de Dados"}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar de Ficheiro
              </CardTitle>
              <CardDescription>
                Importe uma configuração de um ficheiro JSON local
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleFileImport} variant="outline" className="w-full">
                Selecionar Ficheiro JSON
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
