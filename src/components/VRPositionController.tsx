
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface VRPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

interface VRPositionControllerProps {
  position: VRPosition;
  onPositionChange: (position: VRPosition) => void;
}

const VRPositionController = ({
  position,
  onPositionChange,
}: VRPositionControllerProps) => {
  
  const handleChange = (key: string, value: number | { x: number; y: number; z: number }) => {
    const newPosition = { ...position };
    
    if (key === "rotation") {
      newPosition.rotation = value as { x: number; y: number; z: number };
    } else {
      newPosition[key as keyof VRPosition] = value as number;
    }
    
    onPositionChange(newPosition);
  };

  const handleRotationChange = (axis: string, value: number) => {
    const newRotation = { ...position.rotation, [axis]: value };
    handleChange("rotation", newRotation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>VR Position & Scale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="position-x">X Position</Label>
              <span className="text-sm text-muted-foreground">{position.x.toFixed(1)}</span>
            </div>
            <Slider
              id="position-x"
              value={[position.x]}
              min={-10}
              max={10}
              step={0.1}
              onValueChange={(value) => handleChange("x", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="position-y">Y Position</Label>
              <span className="text-sm text-muted-foreground">{position.y.toFixed(1)}</span>
            </div>
            <Slider
              id="position-y"
              value={[position.y]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(value) => handleChange("y", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="position-z">Z Position</Label>
              <span className="text-sm text-muted-foreground">{position.z.toFixed(1)}</span>
            </div>
            <Slider
              id="position-z"
              value={[position.z]}
              min={-10}
              max={10}
              step={0.1}
              onValueChange={(value) => handleChange("z", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="scale">Scale</Label>
              <span className="text-sm text-muted-foreground">{position.scale.toFixed(1)}</span>
            </div>
            <Slider
              id="scale"
              value={[position.scale]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={(value) => handleChange("scale", value[0])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Rotation</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rotation-x">X Rotation</Label>
              <span className="text-sm text-muted-foreground">{position.rotation.x}°</span>
            </div>
            <Slider
              id="rotation-x"
              value={[position.rotation.x]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => handleRotationChange("x", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rotation-y">Y Rotation</Label>
              <span className="text-sm text-muted-foreground">{position.rotation.y}°</span>
            </div>
            <Slider
              id="rotation-y"
              value={[position.rotation.y]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => handleRotationChange("y", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rotation-z">Z Rotation</Label>
              <span className="text-sm text-muted-foreground">{position.rotation.z}°</span>
            </div>
            <Slider
              id="rotation-z"
              value={[position.rotation.z]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => handleRotationChange("z", value[0])}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VRPositionController;
