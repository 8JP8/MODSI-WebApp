
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface VRScenePreviewProps {
  chartType: string;
  position: VRPosition;
}

const VRScenePreview = ({ chartType, position }: VRScenePreviewProps) => {
  // This is just a placeholder for the actual VR scene
  // In a real implementation, this would integrate with A-Frame/BabiaXR

  const getChartEmoji = () => {
    switch (chartType) {
      case "bar":
        return "📊";
      case "pie":
        return "🥧";
      case "line":
        return "📈";
      case "scatter":
        return "⚬";
      default:
        return "📊";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>VR Scene Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 bg-vr-background rounded-md overflow-hidden border border-slate-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-lg text-muted-foreground">
              VR Scene (A-Frame + BabiaXR preview)
            </div>
          </div>
          
          {/* This would be replaced with actual A-Frame/BabiaXR */}
          <div 
            className="absolute p-4 bg-vr-panel rounded-lg shadow-lg animate-float"
            style={{
              left: `${(position.x + 10) * 5}%`, 
              top: `${100 - (position.y + 1) * 10}%`,
              transform: `scale(${position.scale * 0.3}) rotate(${position.rotation.y}deg)`,
              zIndex: Math.round(10 - position.z)
            }}
          >
            <div className="text-3xl">
              {getChartEmoji()}
              <span className="ml-2 text-xs text-slate-400">
                {chartType} at ({position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)})
              </span>
            </div>
          </div>
          
          {/* Floor grid for reference */}
          <div className="absolute bottom-0 w-full h-1/4 border-t border-slate-700 bg-gradient-to-t from-slate-900 to-transparent">
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
              {Array(10).fill(0).map((_, i) => (
                Array(10).fill(0).map((_, j) => (
                  <div key={`${i}-${j}`} className="border border-slate-800 opacity-20" />
                ))
              ))}
            </div>
          </div>
          
          {/* Reference axes */}
          <div className="absolute bottom-0 left-0 h-12 w-1 bg-red-500" title="Y-axis"></div>
          <div className="absolute bottom-0 left-0 w-12 h-1 bg-blue-500" title="X-axis"></div>
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-green-500 transform-gpu -translate-z-12" 
               style={{ transform: 'translateZ(12px)' }} title="Z-axis"></div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>This is a simplified preview. In the full implementation, this would use A-Frame and BabiaXR to create an interactive 3D visualization.</p>
          <p className="mt-2">Position: ({position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)})</p>
          <p>Rotation: ({position.rotation.x}°, {position.rotation.y}°, {position.rotation.z}°)</p>
          <p>Scale: {position.scale.toFixed(1)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VRScenePreview;
