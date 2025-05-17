
import { useState } from "react";
import sampleData from "../../data/sampleVisualization.json";
import ChartDataManager from "./ChartDataManager";
import DashboardHeader from "./DashboardHeader";
import ChartSelector from "./ChartSelector";
import DataIndicatorSelector from "@/components/DataIndicatorSelector";
import MainPreviewTabs from "./MainPreviewTabs";
import VRLaunchDialog from "@/components/VRLaunchDialog";
import { toast } from "sonner";

const VRDashboard = () => {
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  
  const joinVisualization = (roomCode: string) => {
    if (!roomCode.trim()) {
      toast.error("Por favor, insira um código de sala");
      return;
    }
    
    toast.success(`Entrando na sala de visualização: ${roomCode}`);
    setLaunchDialogOpen(false);
  };

  const launchVR = () => {
    // This would be integrated with A-Frame/BabiaXR in a full implementation
    toast.success("Configuração de cena VR salva! Pronto para iniciar a experiência VR.");
    
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
            onSave={handleExportJSON}
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
  );
};

export default VRDashboard;
