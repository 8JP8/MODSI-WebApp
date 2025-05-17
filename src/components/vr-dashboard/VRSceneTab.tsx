
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          <VRScenePreview 
            chartType={chartType} 
            position={position} 
            charts={charts}
            activeChartId={activeChartId}
          />
          <Card>
            <CardContent className="pt-4">
              <Tabs defaultValue="position">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="position">Posição</TabsTrigger>
                  <TabsTrigger value="rotation">Rotação</TabsTrigger>
                  <TabsTrigger value="dimensions">Dimensões</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <div>
        <VRPositionController 
          position={position} 
          onPositionChange={onPositionChange} 
        />
      </div>
    </div>
  );
};

export default VRSceneTab;
