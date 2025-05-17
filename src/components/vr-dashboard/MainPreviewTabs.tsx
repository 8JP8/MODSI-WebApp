
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Settings2 } from "lucide-react";
import ChartPreviewTab from "./ChartPreviewTab";
import VRSceneTab from "./VRSceneTab";
import ConfigurationManager from "@/components/ConfigurationManager";
import { Chart, VRPosition } from "@/types/vr-dashboard";

interface MainPreviewTabsProps {
  chartType: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
  position: VRPosition;
  charts: Chart[];
  activeChartId: string;
  onPositionChange: (position: VRPosition) => void;
  currentConfig: any;
  onLoadConfig: (config: any) => void;
  onResetConfig: () => void;
  onSaveConfig: () => void;
}

const MainPreviewTabs = ({
  chartType,
  data,
  xAxis,
  yAxis,
  zAxis,
  position,
  charts,
  activeChartId,
  onPositionChange,
  currentConfig,
  onLoadConfig,
  onResetConfig,
  onSaveConfig
}: MainPreviewTabsProps) => {
  return (
    <div className="space-y-6 md:col-span-2">
      <Tabs defaultValue="preview">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualização do Gráfico
          </TabsTrigger>
          <TabsTrigger value="vr">
            <Settings2 className="mr-2 h-4 w-4" />
            Cena VR
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-4">
          <ChartPreviewTab 
            chartType={chartType} 
            data={data} 
            xAxis={xAxis} 
            yAxis={yAxis} 
            zAxis={zAxis} 
          />
        </TabsContent>
        
        <TabsContent value="vr" className="mt-4">
          <VRSceneTab 
            chartType={chartType}
            position={position}
            charts={charts}
            activeChartId={activeChartId}
            onPositionChange={onPositionChange}
          />
        </TabsContent>
      </Tabs>
      
      <ConfigurationManager
        currentConfig={currentConfig}
        onLoadConfig={onLoadConfig}
        onResetConfig={onResetConfig}
        onSaveConfig={onSaveConfig}
      />
    </div>
  );
};

export default MainPreviewTabs;
