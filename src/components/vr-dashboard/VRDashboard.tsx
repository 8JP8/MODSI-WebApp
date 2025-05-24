
import { useState } from "react";
import sampleData from "../../data/sampleVisualization.json";
import ChartDataManager from "./ChartDataManager";
import DashboardHeader from "./DashboardHeader";
import ChartSelector from "./ChartSelector";
import KPIAxisSelector from "@/components/KPIAxisSelector";
import MainPreviewTabs from "./MainPreviewTabs";
import VRLaunchDialog from "@/components/VRLaunchDialog";
import { toast } from "sonner";
import { generateRoomCode, saveVisualizationToHistory } from "@/utils/visualizationUtils";
import { useIsMobile } from "@/hooks/use-mobile";

const VRDashboard = () => {
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const joinVisualization = (roomCode: string) => {
    if (!roomCode.trim()) {
      toast.error("Por favor, introduza um código de sala");
      return;
    }
    
    saveVisualizationToHistory(roomCode);
    window.location.href = `https://modsi-vr.pt/${roomCode}`;
  };

  const launchVR = () => {
    const roomCode = generateRoomCode();
    saveVisualizationToHistory(roomCode);
    
    toast.success("Configuração da cena VR guardada! Pronto para iniciar a experiência VR.");
    console.log("Launching VR with configuration, room code:", roomCode);
    
    window.location.href = `https://modsi-vr.pt/${roomCode}`;
    setLaunchDialogOpen(false);
  };

  const handleLaunchButtonClick = () => {
    setLaunchDialogOpen(true);
  };

  return (
    <ChartDataManager sampleData={sampleData}>
      {({
        charts,
        activeChartId,
        chartType,
        position,
        zAxis,
        secondaryAxis,
        yAxis,
        data,
        configSaved,
        setActiveChartId,
        updateActiveChart,
        handlePositionChange,
        handleZAxisChange,
        handleSecondaryAxisChange,
        handleYAxisChange,
        addNewChart,
        resetConfiguration,
        handleLoadConfig,
        handleExportJSON,
        setConfigSaved
      }) => (
        <div className="container mx-auto px-2 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
          <DashboardHeader 
            onSave={handleExportJSON}
            onLaunch={handleLaunchButtonClick}
            configSaved={configSaved}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-4 md:space-y-6">
              <ChartSelector 
                charts={charts}
                activeChartId={activeChartId}
                onChartSelect={setActiveChartId}
                onAddChart={addNewChart}
              />
              
              <KPIAxisSelector
                selectedZAxis={zAxis}
                selectedSecondaryAxis={secondaryAxis}
                selectedYAxis={yAxis}
                onSelectZAxis={handleZAxisChange}
                onSelectSecondaryAxis={handleSecondaryAxisChange}
                onSelectYAxis={handleYAxisChange}
              />
            </div>
            
            <MainPreviewTabs 
              chartType={chartType}
              data={data}
              xAxis={secondaryAxis}
              yAxis={yAxis}
              zAxis={zAxis}
              position={position}
              charts={charts}
              activeChartId={activeChartId}
              onPositionChange={handlePositionChange}
              currentConfig={{ charts, activeChartId }}
              onLoadConfig={handleLoadConfig}
              onResetConfig={resetConfiguration}
              onSaveConfig={handleExportJSON}
            />
          </div>

          <VRLaunchDialog
            open={launchDialogOpen}
            onOpenChange={setLaunchDialogOpen}
            onLaunch={launchVR}
            onJoin={joinVisualization}
            hasUnsavedChanges={!configSaved}
          />
        </div>
      )}
    </ChartDataManager>
  );
};

export default VRDashboard;
