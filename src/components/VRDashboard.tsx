
import { useState } from "react";
import sampleData from "../data/sampleVisualization.json";
import ChartDataManager from "./vr-dashboard/ChartDataManager";
import DashboardHeader from "./vr-dashboard/DashboardHeader";
import ChartSelector from "./vr-dashboard/ChartSelector";
import DataIndicatorSelector from "@/components/DataIndicatorSelector";
import MainPreviewTabs from "./vr-dashboard/MainPreviewTabs";
import VRLaunchDialog from "@/components/VRLaunchDialog";
import { toast } from "sonner";
import RequireAuth from "./RequireAuth";

const VRDashboard = () => {
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  
  const joinVisualization = (roomCode: string) => {
    if (!roomCode.trim()) {
      toast.error("Por favor, introduza um código de sala");
      return;
    }
    
    // Save the visualization code to history
    saveVisualizationToHistory(roomCode);
    
    toast.success(`A entrar na sala de visualização: ${roomCode}`);
    setLaunchDialogOpen(false);
  };

  const saveVisualizationToHistory = (code: string) => {
    try {
      // Get existing history or initialize empty array
      const historyStr = localStorage.getItem("visualizationHistory");
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      // Add new code if not already in history
      if (!history.includes(code)) {
        const newHistory = [code, ...history].slice(0, 10); // Keep only last 10
        localStorage.setItem("visualizationHistory", JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error("Error saving visualization to history:", error);
    }
  };

  const launchVR = () => {
    // This would be integrated with A-Frame/BabiaXR in a full implementation
    toast.success("Configuração da cena VR guardada! Pronto para iniciar a experiência VR.");
    
    // In a real app, we would either:
    // 1. Navigate to a VR scene page
    // 2. Launch a VR experience in a new window/tab
    // 3. Initialize A-Frame in the current page
    console.log("Launching VR with configuration");
    
    setLaunchDialogOpen(false);
  };

  const handleLaunchButtonClick = () => {
    setLaunchDialogOpen(true);
  };

  return (
    <RequireAuth>
      <ChartDataManager sampleData={sampleData}>
        {({
          charts,
          activeChartId,
          chartType,
          position,
          xAxis,
          yAxis,
          zAxis,
          data,
          availableIndicators,
          departments,
          selectedDepartment,
          configSaved,
          setActiveChartId,
          updateActiveChart,
          handlePositionChange,
          handleXAxisChange,
          handleYAxisChange,
          handleZAxisChange,
          handleDepartmentChange,
          addNewChart,
          resetConfiguration,
          handleLoadConfig,
          handleExportJSON,
          setConfigSaved
        }) => (
          <div className="container mx-auto py-6 space-y-6">
            <DashboardHeader 
              onLaunch={handleLaunchButtonClick}
              configSaved={configSaved}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-6">
                <ChartSelector 
                  charts={charts}
                  activeChartId={activeChartId}
                  onChartSelect={setActiveChartId}
                  onAddChart={addNewChart}
                />
                
                <DataIndicatorSelector
                  availableIndicators={availableIndicators}
                  onSelectXAxis={handleXAxisChange}
                  onSelectYAxis={handleYAxisChange}
                  onSelectZAxis={handleZAxisChange}
                  selectedX={xAxis}
                  selectedY={yAxis}
                  selectedZ={zAxis}
                  chartType={chartType}
                  onSelectChartType={(type) => updateActiveChart({ chartType: type })}
                  departments={departments}
                  selectedDepartment={selectedDepartment}
                  onDepartmentChange={handleDepartmentChange}
                  allowDeselectDepartment={true}
                />
              </div>
              
              <MainPreviewTabs 
                chartType={chartType}
                data={data}
                xAxis={xAxis}
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
    </RequireAuth>
  );
};

export default VRDashboard;
