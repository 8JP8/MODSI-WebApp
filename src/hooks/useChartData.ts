import { useState, useEffect } from "react";
import { Chart, VRPosition, defaultPosition, CHART_COLORS } from "@/types/vr-dashboard";
import { useChartDataProcessor } from "./useChartDataProcessor";
import { fetchKPIValueHistory, fetchUserKPIs } from "@/services/kpiService";
import { toast } from "sonner";

// Helper function to translate chart types to VR format
const translateChartType = (chartType: string): string => {
  switch (chartType) {
    case "bar":
      return "babia-bars";
    case "pie":
      return "babia-pie";
    case "cyls":
      return "babia-cyls";
    case "scatter":
      return "babia-bubbles";
    default:
      return "babia-bars";
  }
};

export const useChartData = () => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeChartId, setActiveChartId] = useState<string>("");
  const [chartType, setChartType] = useState("bar");
  const [position, setPosition] = useState<VRPosition>(defaultPosition);
  const [yAxis, setYAxis] = useState(""); // Main KPI - Y axis selector
  const [secondaryAxis, setSecondaryAxis] = useState(""); // X axis - time
  const [zAxis, setZAxis] = useState(""); // Optional KPI - Z axis selector
  const [data, setData] = useState<any[]>([]);
  const [configSaved, setConfigSaved] = useState(false);

  // Function to check if configuration is valid
  const isConfigurationValid = (): boolean => {
    return charts.some(chart => chart.yAxis && chart.yAxis.trim() !== "");
  };

  // Initialize with one chart
  useEffect(() => {
    if (charts.length === 0) {
      addNewChart();
    }
  }, []);

  // When a chart is added or selected
  useEffect(() => {
    if (activeChartId && charts.length > 0) {
      const activeChart = charts.find(chart => chart.id === activeChartId);
      if (activeChart) {
        setChartType(activeChart.chartType);
        setPosition(activeChart.position);
        setYAxis(activeChart.yAxis);
        setSecondaryAxis(activeChart.xAxis);
        setZAxis(activeChart.zAxis);
      }
    }
  }, [activeChartId, charts]);

  // Adding a new chart
  const addNewChart = () => {
    const newChartId = `chart-${Date.now()}`;
    const colorIndex = charts.length % CHART_COLORS.length;
    
    const newChart: Chart = {
      id: newChartId,
      chartType: "bar",
      position: { ...defaultPosition },
      xAxis: "",
      yAxis: "",
      zAxis: "",
      color: CHART_COLORS[colorIndex]
    };
    
    setCharts(prevCharts => [...prevCharts, newChart]);
    setActiveChartId(newChartId);
    toast.success("Novo gráfico adicionado");
  };

  // FIX: Add a function to handle chart deletion
  const deleteChart = (id: string) => {
    if (charts.length <= 1) {
      toast.error("Não é possível remover o último gráfico.");
      return;
    }

    const updatedCharts = charts.filter(chart => chart.id !== id);
    setCharts(updatedCharts);
    toast.success("Gráfico removido com sucesso.");

    // If the active chart was deleted, set a new active chart (e.g., the first one)
    if (activeChartId === id) {
      const newActiveId = updatedCharts.length > 0 ? updatedCharts[0].id : "";
      setActiveChartId(newActiveId);
    }
  };

  // Update properties of the active chart
  const updateActiveChart = (updates: Partial<Chart>) => {
    setCharts(prevCharts => 
      prevCharts.map(chart => 
        chart.id === activeChartId 
          ? { ...chart, ...updates } 
          : chart
      )
    );
    
    if (updates.chartType) {
      setChartType(updates.chartType);
    }
  };
  
  const handlePositionChange = (newPosition: VRPosition) => {
    setPosition(newPosition);
    updateActiveChart({ position: newPosition });
  };
  
  const handleYAxisChange = (value: string) => {
    setYAxis(value);
    setZAxis(""); 
    updateActiveChart({ yAxis: value, zAxis: "" }); 
  };
  
  const handleSecondaryAxisChange = (value: string) => {
    setSecondaryAxis(value);
    updateActiveChart({ xAxis: value });
  };
  
  const handleZAxisChange = (value: string) => {
    const zAxisValue = value === "none" ? "" : value;
    setZAxis(zAxisValue);
    updateActiveChart({ zAxis: zAxisValue });
  };

  const resetConfiguration = () => {
    setChartType("bar");
    setPosition(defaultPosition);
    setYAxis("");
    setSecondaryAxis("");
    setZAxis("");
    
    if (activeChartId) {
      updateActiveChart({
        chartType: "bar",
        position: { ...defaultPosition },
        xAxis: "",
        yAxis: "",
        zAxis: ""
      });
    }
    
    toast.info("Configuração restaurada aos padrões");
  };

  const handleLoadConfig = (config: any) => {
    let configToLoad = config;
    
    if (Array.isArray(config) && config.length > 0) {
      configToLoad = config[0].config;
    }
    
    if (configToLoad.charts && Array.isArray(configToLoad.charts)) {
      const completeCharts = configToLoad.charts.map((chart: any) => ({
        ...chart,
        position: {
          ...chart.position,
          width: chart.position.width || 1,
          height: chart.position.height || 1,
          depth: chart.position.depth || 1
        },
        chartType: chart.chartType === 'babia-bars' ? 'bar' : 
                  chart.chartType === 'babia-pie' ? 'pie' :
                  chart.chartType === 'babia-cyls' ? 'cyls' :
                  chart.chartType === 'babia-bubbles' ? 'scatter' : 'bar'
      }));
      
      setCharts(completeCharts);
      
      if (completeCharts.length > 0) {
        const activeChart = completeCharts.find(c => c.id === configToLoad.activeChartId) || completeCharts[0];
        setActiveChartId(activeChart.id);
        setChartType(activeChart.chartType);
        setPosition(activeChart.position);
        setYAxis(activeChart.yAxis);
        setSecondaryAxis(activeChart.xAxis);
        setZAxis(activeChart.zAxis || "");
      }
    }
    
    setConfigSaved(true);
    toast.success("Configuração carregada com sucesso");
  };

  const getCurrentConfiguration = async () => {
    try {
      const allKpiIds: string[] = [];
      charts.forEach(chart => {
        if (chart.yAxis && !allKpiIds.includes(chart.yAxis)) allKpiIds.push(chart.yAxis);
        if (chart.zAxis && !allKpiIds.includes(chart.zAxis)) allKpiIds.push(chart.zAxis);
      });

      const allHistories: any[] = [];
      for (const kpiId of allKpiIds) {
        try {
          const history = await fetchKPIValueHistory(kpiId);
          allHistories.push(...history);
        } catch (error) {
          console.error(`Error fetching history for KPI ${kpiId}:`, error);
        }
      }

      const kpiOptions = await fetchUserKPIs();
      
      const unifiedCharts = await Promise.all(
        charts.map(async (chart) => {
          let graphname = "KPIName";
          if (chart.yAxis) {
            const kpi = kpiOptions.find(option => option.id === chart.yAxis);
            if (kpi) graphname = kpi.name;
          }
          if (chart.zAxis) {
            const zAxisKpi = kpiOptions.find(option => option.id === chart.zAxis);
            if (zAxisKpi) graphname = `${graphname} / ${zAxisKpi.name}`;
          }
          
          return {
            id: chart.id,
            chartType: translateChartType(chart.chartType),
            graphname: graphname,
            position: chart.position,
            xAxis: chart.xAxis,
            yAxis: chart.yAxis || "",
            zAxis: chart.zAxis || "",
            color: chart.color
          };
        })
      );

      return [{
          name: "Configuração VR",
          config: {
            kpihistory: allHistories,
            charts: unifiedCharts,
            activeChartId: activeChartId
          }
        }];
    } catch (error) {
      console.error("Error getting current configuration:", error);
      throw error;
    }
  };

  const handleExportJSON = async () => {
    try {
      const config = await getCurrentConfiguration();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configuracao-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Configuração exportada com sucesso");
      setConfigSaved(true);
    } catch (error) {
      console.error("Error exporting configuration:", error);
      toast.error("Erro ao exportar configuração");
    }
  };

  const autoSaveConfiguration = async () => {
    try {
      const config = await getCurrentConfiguration();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const configName = `Configuração VR ${timestamp}`;
      const savedConfigsStr = localStorage.getItem("vrDataConfigs");
      const savedConfigs = savedConfigsStr ? JSON.parse(savedConfigsStr) : [];
      const newConfig = { name: configName, config: config[0].config };
      const newConfigs = [newConfig, ...savedConfigs.slice(0, 9)];
      localStorage.setItem("vrDataConfigs", JSON.stringify(newConfigs));
      toast.success(`Configuração guardada: ${configName}`);
      return config;
    } catch (error) {
      console.error("Error auto-saving configuration:", error);
      throw error;
    }
  };

  const getConfigurationForVR = async () => {
    return await autoSaveConfiguration();
  };

  const { chartData, loading: dataLoading, kpiUnits } = useChartDataProcessor(yAxis, secondaryAxis, zAxis);

  useEffect(() => {
    setData(chartData);
  }, [chartData]);

  return {
    charts,
    activeChartId,
    chartType,
    position,
    yAxis,
    secondaryAxis,
    zAxis,
    data: chartData,
    configSaved: isConfigurationValid(),
    loading: dataLoading,
    kpiUnits,
    setActiveChartId,
    updateActiveChart,
    handlePositionChange,
    handleYAxisChange,
    handleSecondaryAxisChange,
    handleZAxisChange,
    addNewChart,
    deleteChart,
    resetConfiguration,
    handleLoadConfig,
    handleExportJSON,
    setConfigSaved,
    getCurrentConfiguration,
    getConfigurationForVR,
    isConfigurationValid
  };
};