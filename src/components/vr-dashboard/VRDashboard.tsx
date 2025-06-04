
import { useState } from "react";
import ChartDataManager from "./ChartDataManager";
import DashboardHeader from "./DashboardHeader";
import ChartSelector from "./ChartSelector";
import KPIAxisSelector from "@/components/KPIAxisSelector";
import MainPreviewTabs from "./MainPreviewTabs";
import VRLaunchDialog from "@/components/VRLaunchDialog";
import ChartTypeSelector from "@/components/ChartTypeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createRoom } from "@/services/roomService";
import { saveVisualizationToHistory } from "@/utils/visualizationUtils";
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
    window.location.href = `/room/${roomCode}`;
  };

  const launchVR = async (getConfigurationForVR: () => Promise<any>) => {
    try {
      console.log("Creating room with VR configuration...");
      
      // Get unified configuration with auto-save
      const configurationData = await getConfigurationForVR();
      
      // Send the full unified configuration
      const roomCode = await createRoom(configurationData);
      
      if (!roomCode) {
        throw new Error("Falha ao criar sala - código não recebido");
      }
      
      // Save the room code to visualization history
      saveVisualizationToHistory(roomCode);
      
      console.log("Room created with code:", roomCode);
      
      // Direct redirect without loading state
      window.location.href = `/room/${roomCode}`;
      setLaunchDialogOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Erro ao criar sala VR. Tente novamente.");
    }
  };

  const handleLaunchButtonClick = () => {
    setLaunchDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <ChartDataManager>
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
          setConfigSaved,
          getCurrentConfiguration,
          getConfigurationForVR,
          isConfigurationValid
        }) => (
          <div className="container mx-auto px-2 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
            <DashboardHeader 
              onSave={handleExportJSON}
              onLaunch={handleLaunchButtonClick}
              configSaved={isConfigurationValid()}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-4 md:space-y-6">
                <ChartSelector 
                  charts={charts}
                  activeChartId={activeChartId}
                  onChartSelect={setActiveChartId}
                  onAddChart={addNewChart}
                />
                
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle>Tipo de Gráfico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartTypeSelector 
                      selectedType={chartType} 
                      onSelect={(type) => {
                        updateActiveChart({ chartType: type });
                      }} 
                    />
                  </CardContent>
                </Card>
                
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
                onExportCurrentConfig={handleExportJSON}
              />
            </div>

            <VRLaunchDialog
              open={launchDialogOpen}
              onOpenChange={setLaunchDialogOpen}
              onLaunch={() => launchVR(getConfigurationForVR)}
              onJoin={joinVisualization}
              hasUnsavedChanges={!isConfigurationValid()}
            />
          </div>
        )}
      </ChartDataManager>
    </div>
  );
};

export default VRDashboard;
