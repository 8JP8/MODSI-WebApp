
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VRLaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunch: () => void;
  onJoin: (roomCode: string) => void;
  hasUnsavedChanges: boolean;
}

const VRLaunchDialog = ({
  open,
  onOpenChange,
  onLaunch,
  onJoin,
  hasUnsavedChanges,
}: VRLaunchDialogProps) => {
  const [roomCode, setRoomCode] = useState("");

  const handleJoinVisualization = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a visualization ID");
      return;
    }
    
    onJoin(roomCode);
    onOpenChange(false);
  };
  
  const handleLaunchVisualization = () => {
    if (hasUnsavedChanges) {
      toast.error("Please save your configuration before launching");
      return;
    }
    
    onLaunch();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Launch VR Experience</DialogTitle>
          <DialogDescription>
            Choose how you want to enter the VR experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Launch your configuration</h3>
            <p className="text-sm text-muted-foreground">
              Launch the VR experience with your current configuration
            </p>
            <Button 
              onClick={handleLaunchVisualization}
              className="w-full"
              disabled={hasUnsavedChanges}
            >
              Launch My Configuration
            </Button>
            {hasUnsavedChanges && (
              <p className="text-xs text-amber-500">
                Save your configuration before launching
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Join existing visualization</h3>
            <p className="text-sm text-muted-foreground">
              Enter a visualization ID to join an existing VR experience
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter visualization ID"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <Button onClick={handleJoinVisualization}>Join</Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VRLaunchDialog;
