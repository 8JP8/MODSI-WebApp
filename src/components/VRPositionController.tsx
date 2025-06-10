import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { VRPosition } from "@/types/vr-dashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VRPositionControllerProps {
  position: VRPosition;
  onPositionChange: (position: VRPosition) => void;
}

const VRPositionController = ({ position, onPositionChange }: VRPositionControllerProps) => {
  const [activeTab, setActiveTab] = useState("position");

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = { ...position, [axis]: value };
    onPositionChange(newPosition);
  };

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = {
      ...position,
      rotation: { ...position.rotation, [axis]: value },
    };
    onPositionChange(newPosition);
  };

  const handleSizeChange = (dim: "width" | "height" | "depth" | "scale", value: number) => {
    const newPosition = { ...position, [dim]: value };
    onPositionChange(newPosition);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controlo de Posicionamento 3D</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  <label className="text-sm font-medium">Eixo X: {position.x.toFixed(1)}</label>
                  <span className="text-xs text-muted-foreground">[-10, 10]</span>
                </div>
                <Slider 
                  value={[position.x]} 
                  min={-10} 
                  max={10} 
                  step={0.1} 
                  onValueChange={(values) => handlePositionChange("x", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Eixo Y: {position.y.toFixed(1)}</label>
                  <span className="text-xs text-muted-foreground">[0, 10]</span>
                </div>
                <Slider 
                  value={[position.y]} 
                  min={0} 
                  max={10} 
                  step={0.1} 
                  onValueChange={(values) => handlePositionChange("y", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Eixo Z: {position.z.toFixed(1)}</label>
                  <span className="text-xs text-muted-foreground">[-10, 10]</span>
                </div>
                <Slider 
                  value={[position.z]} 
                  min={-10} 
                  max={10} 
                  step={0.1} 
                  onValueChange={(values) => handlePositionChange("z", values[0])} 
                />
              </div>
            </div>
          )}

          {activeTab === "rotation" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Rotação X: {position.rotation.x.toFixed(1)}°</label>
                  <span className="text-xs text-muted-foreground">[0°, 360°]</span>
                </div>
                <Slider 
                  value={[position.rotation.x]} 
                  min={0} 
                  max={360} 
                  step={1} 
                  onValueChange={(values) => handleRotationChange("x", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Rotação Y: {position.rotation.y.toFixed(1)}°</label>
                  <span className="text-xs text-muted-foreground">[0°, 360°]</span>
                </div>
                <Slider 
                  value={[position.rotation.y]} 
                  min={0} 
                  max={360} 
                  step={1} 
                  onValueChange={(values) => handleRotationChange("y", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Rotação Z: {position.rotation.z.toFixed(1)}°</label>
                  <span className="text-xs text-muted-foreground">[0°, 360°]</span>
                </div>
                <Slider 
                  value={[position.rotation.z]} 
                  min={0} 
                  max={360} 
                  step={1} 
                  onValueChange={(values) => handleRotationChange("z", values[0])} 
                />
              </div>
            </div>
          )}

          {activeTab === "size" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Escala: {position.scale.toFixed(1)}x</label>
                  <span className="text-xs text-muted-foreground">[0.5, 2]</span>
                </div>
                <Slider 
                  value={[position.scale]} 
                  min={0.5} 
                  max={2} 
                  step={0.1} 
                  onValueChange={(values) => handleSizeChange("scale", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Largura: {position.width.toFixed(1)}</label>
                  <span className="text-xs text-muted-foreground">[0.5, 3]</span>
                </div>
                <Slider 
                  value={[position.width]} 
                  min={0.5} 
                  max={3} 
                  step={0.1} 
                  onValueChange={(values) => handleSizeChange("width", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Altura: {position.height.toFixed(1)}</label>
                  <span className="text-xs text-muted-foreground">[0.5, 3]</span>
                </div>
                <Slider 
                  value={[position.height]} 
                  min={0.5} 
                  max={3} 
                  step={0.1} 
                  onValueChange={(values) => handleSizeChange("height", values[0])} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Profundidade: {position.depth.toFixed(1)}</label>
                  <span className="text-xs text-muted-foreground">[0.5, 3]</span>
                </div>
                <Slider 
                  value={[position.depth]} 
                  min={0.5} 
                  max={3} 
                  step={0.1} 
                  onValueChange={(values) => handleSizeChange("depth", values[0])} 
                />
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VRPositionController;