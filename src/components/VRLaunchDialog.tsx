
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveVisualizationToHistory } from "@/utils/visualizationUtils";

interface VRLaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunch: () => void;
  onJoin: (roomCode: string) => void;
  hasUnsavedChanges?: boolean;
}

const VRLaunchDialog = ({
  open,
  onOpenChange,
  onLaunch,
  onJoin,
  hasUnsavedChanges = false,
}: VRLaunchDialogProps) => {
  const [roomCode, setRoomCode] = useState("");
  
  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      // Save to history before joining
      saveVisualizationToHistory(roomCode.trim());
      onJoin(roomCode.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Experiência VR</DialogTitle>
          <DialogDescription>
            Inicie a sua experiência de visualização VR
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="launch" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="launch">Iniciar Sala</TabsTrigger>
            <TabsTrigger value="join">Entrar em Sala</TabsTrigger>
          </TabsList>
          
          <TabsContent value="launch" className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Inicie uma nova sala de visualização VR com a sua configuração atual.
              </p>
              
              {hasUnsavedChanges && (
                <div className="bg-yellow-500/10 border border-yellow-600 mt-4 p-3 rounded-md">
                  <p className="text-sm text-yellow-600">
                    Tem alterações não guardadas. Por favor, guarde a sua configuração antes de iniciar.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                className="w-full vr-button" 
                onClick={onLaunch}
                disabled={hasUnsavedChanges}
              >
                Iniciar Experiência VR
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4 py-4">
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Insira um código de sala para entrar numa visualização VR existente.
              </p>
              <Input
                id="room-code"
                placeholder="Insira o código da sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button 
                className="w-full vr-button" 
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
              >
                Entrar na Sala
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VRLaunchDialog;
