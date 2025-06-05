
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Settings2 } from "lucide-react";
import ChartPreviewTab from "./ChartPreviewTab";
import VRSceneTab from "./VRSceneTab";
import ConfigurationManager from "@/components/ConfigurationManager";
import { Chart, VRPosition } from "@/types/vr-dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onExportCurrentConfig?: () => void;
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
  onSaveConfig,
  onExportCurrentConfig
}: MainPreviewTabsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="lg:col-span-3 space-y-4 md:space-y-6">
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="preview" className="text-xs md:text-sm group">
            <Eye className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 group-hover:rotate-12" />
            {isMobile ? "Gráfico" : "Pré-visualização do Gráfico"}
          </TabsTrigger>
          <TabsTrigger value="vr" className="text-xs md:text-sm group">
            <Settings2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 group-hover:rotate-12" />
            Cena VR
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-2 md:mt-4">
          <ChartPreviewTab 
            chartType={chartType} 
            data={data} 
            xAxis={xAxis} 
            yAxis={yAxis} 
            zAxis={zAxis} 
          />
        </TabsContent>
        
        <TabsContent value="vr" className="mt-2 md:mt-4">
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
        onExportCurrentConfig={onExportCurrentConfig}
      />
    </div>
  );
};

export default MainPreviewTabs;
