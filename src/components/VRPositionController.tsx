import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { VRPosition } from "@/types/vr-dashboard"; // Adjust this import path if needed
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface VRPositionControllerProps {
  position: VRPosition;
  onPositionChange: (position: VRPosition) => void;
}

// --- CHANGE: Default position is now 0, 0, -2 ---
const DEFAULT_VR_POSITION: VRPosition = {
  x: 0,
  y: 0,
  z: -2,
  scale: 1,
  width: 1,
  height: 1,
  depth: 1,
  rotation: { x: 0, y: 0, z: 0 },
};

const NULL_VR_POSITION: VRPosition = {
  x: null,
  y: null,
  z: null,
  scale: null,
  width: null,
  height: null,
  depth: null,
  rotation: { x: null, y: null, z: null },
};

const VRPositionController = ({ position, onPositionChange }: VRPositionControllerProps) => {
  const [activeTab, setActiveTab] = useState("position");

  // Internal state to remember the position even when toggled off
  const [isEnabled, setIsEnabled] = useState(position.x !== null);
  const [editedPosition, setEditedPosition] = useState<VRPosition>(
    position.x !== null ? position : DEFAULT_VR_POSITION
  );

  // Effect to update internal state when the selected chart (and its position prop) changes
  useEffect(() => {
    const isInitiallyEnabled = position.x !== null;
    setIsEnabled(isInitiallyEnabled);
    setEditedPosition(isInitiallyEnabled ? position : DEFAULT_VR_POSITION);
  }, [position]);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      // When turning ON, send the remembered position to the parent
      onPositionChange(editedPosition);
    } else {
      // When turning OFF, send null to the parent to clear JSON
      onPositionChange(NULL_VR_POSITION);
    }
  };

  // Generic handler for all sliders, updating internal state
  const handleValueChange = (update: Partial<VRPosition> | { rotation: Partial<VRPosition['rotation']> }) => {
    const newPosition = {
      ...editedPosition,
      ...update,
      rotation: {
        ...editedPosition.rotation,
        ...(update as any).rotation,
      },
    };
    setEditedPosition(newPosition);
    
    // If the controls are enabled, immediately propagate the change to the parent
    if (isEnabled) {
      onPositionChange(newPosition);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Controlo de Posicionamento 3D</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 rounded-lg bg-slate-800 p-4">
          <Switch id="position-toggle" checked={isEnabled} onCheckedChange={handleToggle} />
          <Label htmlFor="position-toggle" className="flex-grow cursor-pointer text-base font-semibold">
            Posicionamento personalizado
          </Label>
        </div>

        <fieldset
          disabled={!isEnabled}
          className={`space-y-4 transition-opacity duration-300 ${!isEnabled ? 'opacity-50' : 'opacity-100'}`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4 w-full">
              <TabsTrigger value="position" className="text-xs px-1">
                <span>Posição</span>
              </TabsTrigger>
              <TabsTrigger value="rotation" className="text-xs px-1">
                <span>Rotação</span>
              </TabsTrigger>
              <TabsTrigger value="size" className="text-xs px-1">
                <span>Dimensões</span>
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "position" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Eixo X: {editedPosition.x?.toFixed(1)}</label>
                    <span className="text-xs text-muted-foreground">[-10, 10]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.x ?? 0]} 
                    min={-10} max={10} step={0.1} 
                    onValueChange={(values) => handleValueChange({ x: values[0] })} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Eixo Y: {editedPosition.y?.toFixed(1)}</label>
                    <span className="text-xs text-muted-foreground">[0, 10]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.y ?? 0]} 
                    min={0} max={10} step={0.1} 
                    onValueChange={(values) => handleValueChange({ y: values[0] })} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Eixo Z: {editedPosition.z?.toFixed(1)}</label>
                    <span className="text-xs text-muted-foreground">[-10, 10]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.z ?? -2]} 
                    min={-10} max={10} step={0.1} 
                    onValueChange={(values) => handleValueChange({ z: values[0] })} 
                  />
                </div>
              </div>
            )}
            
            {activeTab === "rotation" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Rotação X: {editedPosition.rotation.x?.toFixed(1)}°</label>
                    <span className="text-xs text-muted-foreground">[0°, 360°]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.rotation.x ?? 0]} 
                    min={0} max={360} step={1} 
                    onValueChange={(values) => handleValueChange({ rotation: { x: values[0] } })} 
                  />
                </div>
                 <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Rotação Y: {editedPosition.rotation.y?.toFixed(1)}°</label>
                    <span className="text-xs text-muted-foreground">[0°, 360°]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.rotation.y ?? 0]} 
                    min={0} max={360} step={1} 
                    onValueChange={(values) => handleValueChange({ rotation: { y: values[0] } })} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Rotação Z: {editedPosition.rotation.z?.toFixed(1)}°</label>
                    <span className="text-xs text-muted-foreground">[0°, 360°]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.rotation.z ?? 0]} 
                    min={0} max={360} step={1} 
                    onValueChange={(values) => handleValueChange({ rotation: { z: values[0] } })} 
                  />
                </div>
              </div>
            )}

            {activeTab === "size" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Escala: {editedPosition.scale?.toFixed(1)}x</label>
                    <span className="text-xs text-muted-foreground">[0.5, 2]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.scale ?? 1]} 
                    min={0.5} max={2} step={0.1} 
                    onValueChange={(values) => handleValueChange({ scale: values[0] })} 
                  />
                </div>
                 <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Largura: {editedPosition.width?.toFixed(1)}</label>
                    <span className="text-xs text-muted-foreground">[0.5, 3]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.width ?? 1]} 
                    min={0.5} max={3} step={0.1} 
                    onValueChange={(values) => handleValueChange({ width: values[0] })} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Altura: {editedPosition.height?.toFixed(1)}</label>
                    <span className="text-xs text-muted-foreground">[0.5, 3]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.height ?? 1]} 
                    min={0.5} max={3} step={0.1} 
                    onValueChange={(values) => handleValueChange({ height: values[0] })} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Profundidade: {editedPosition.depth?.toFixed(1)}</label>
                    <span className="text-xs text-muted-foreground">[0.5, 3]</span>
                  </div>
                  <Slider 
                    value={[editedPosition.depth ?? 1]} 
                    min={0.5} max={3} step={0.1} 
                    onValueChange={(values) => handleValueChange({ depth: values[0] })} 
                  />
                </div>
              </div>
            )}
          </Tabs>
        </fieldset>
      </CardContent>
    </Card>
  );
};

export default VRPositionController;