
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VRScenePreview from "@/components/VRScenePreview";
import VRPositionController from "@/components/VRPositionController";
import { Chart, VRPosition } from "@/types/vr-dashboard";

interface VRSceneTabProps {
  chartType: string;
  position: VRPosition;
  charts: Chart[];
  activeChartId: string;
  onPositionChange: (position: VRPosition) => void;
}

const VRSceneTab = ({ chartType, position, charts, activeChartId, onPositionChange }: VRSceneTabProps) => {
  // Convert our Chart type to whatever VRScenePreview expects
  const vrCharts = charts.map(chart => ({
    ...chart,
    department: "default" // Add default department if VRScenePreview requires it
  }));

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
      <div className="2xl:col-span-2">
        <div className="space-y-4">
          <VRScenePreview 
            chartType={chartType} 
            position={position} 
            charts={vrCharts}
            activeChartId={activeChartId}
          />
        </div>
      </div>
      <div className="2xl:col-span-1">
        <VRPositionController 
          position={position} 
          onPositionChange={onPositionChange} 
        />
      </div>
    </div>
  );
};

export default VRSceneTab;
