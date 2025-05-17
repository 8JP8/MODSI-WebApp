
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>VR Experience</DialogTitle>
          <DialogDescription>
            Launch your VR visualization experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="launch" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="launch">Launch Own Room</TabsTrigger>
            <TabsTrigger value="join">Join Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="launch" className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Start a new VR visualization room with your current configuration.
              </p>
              
              {hasUnsavedChanges && (
                <div className="bg-yellow-500/10 border border-yellow-600 mt-4 p-3 rounded-md">
                  <p className="text-sm text-yellow-600">
                    You have unsaved changes. Please save your configuration before launching.
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
                Launch VR Experience
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4 py-4">
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Enter a room code to join an existing VR visualization.
              </p>
              <Input
                id="room-code"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button 
                className="w-full vr-button" 
                onClick={() => onJoin(roomCode)}
                disabled={!roomCode.trim()}
              >
                Join Room
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VRLaunchDialog;
