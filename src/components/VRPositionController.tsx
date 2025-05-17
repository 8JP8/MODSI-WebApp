
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VRPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  width?: number;
  height?: number;
  depth?: number;
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

const VRPositionController = ({ position, onPositionChange }: VRPositionControllerProps) => {
  const [positionTab, setPositionTab] = useState("position");

  const handlePositionChange = (key: string, value: number) => {
    const updatedPosition = { ...position };
    
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      (updatedPosition as any)[parent][child] = value;
    } else {
      (updatedPosition as any)[key] = value;
    }
    
    onPositionChange(updatedPosition);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handlePositionChange(name, Number(value));
  };
  
  const handleSliderChange = (name: string, value: number[]) => {
    handlePositionChange(name, value[0]);
  };

  const renderSliderWithInput = (name: string, label: string, min: number, max: number, step: number, value: number) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <Slider
              id={`${name}-slider`}
              min={min}
              max={max}
              step={step}
              value={[value]}
              onValueChange={(vals) => handleSliderChange(name, vals)}
            />
          </div>
          <Input
            id={name}
            name={name}
            type="number"
            value={value}
            onChange={handleInputChange}
            className="w-20 text-xs"
            step={step}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Controlos de Posição</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={positionTab} onValueChange={setPositionTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="position" className="px-2 py-1 text-xs whitespace-nowrap">Posição</TabsTrigger>
            <TabsTrigger value="rotation" className="px-2 py-1 text-xs whitespace-nowrap">Rotação</TabsTrigger>
            <TabsTrigger value="dimensions" className="px-2 py-1 text-xs whitespace-nowrap">Dimensões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="position" className="space-y-4 mt-4">
            {renderSliderWithInput("x", "Posição X", -5, 5, 0.1, position.x)}
            {renderSliderWithInput("y", "Posição Y", -5, 5, 0.1, position.y)}
            {renderSliderWithInput("z", "Posição Z", -10, 5, 0.1, position.z)}
            {renderSliderWithInput("scale", "Escala", 0.1, 3, 0.1, position.scale)}
          </TabsContent>
          
          <TabsContent value="rotation" className="space-y-4 mt-4">
            {renderSliderWithInput("rotation.x", "Rotação X", 0, 360, 5, position.rotation.x)}
            {renderSliderWithInput("rotation.y", "Rotação Y", 0, 360, 5, position.rotation.y)}
            {renderSliderWithInput("rotation.z", "Rotação Z", 0, 360, 5, position.rotation.z)}
          </TabsContent>
          
          <TabsContent value="dimensions" className="space-y-4 mt-4">
            {renderSliderWithInput("width", "Largura", 0.1, 3, 0.1, position.width || 1)}
            {renderSliderWithInput("height", "Altura", 0.1, 3, 0.1, position.height || 1)}
            {renderSliderWithInput("depth", "Profundidade", 0.1, 3, 0.1, position.depth || 1)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VRPositionController;
