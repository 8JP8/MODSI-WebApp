import { useState, useEffect } from "react";
import { Chart, VRPosition, defaultPosition, CHART_COLORS } from "@/types/vr-dashboard";
import { useChartDataProcessor } from "./useChartDataProcessor";
import { fetchMultipleKPIHistories, fetchUserKPIs, fetchKPIValueHistory } from "@/services/kpiService";
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
  const [zAxis, setZAxis] = useState("");
  const [secondaryAxis, setSecondaryAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [configSaved, setConfigSaved] = useState(false);

  // Function to check if configuration is valid
  const isConfigurationValid = (): boolean => {
    return charts.some(chart => chart.zAxis && chart.zAxis.trim() !== "");
  };

  // Initialize with one chart
  useEffect(() => {
    addNewChart();
  }, []);

  // When a chart is added or selected
  useEffect(() => {
    if (activeChartId && charts.length > 0) {
      const activeChart = charts.find(chart => chart.id === activeChartId);
      if (activeChart) {
        setChartType(activeChart.chartType);
        setPosition(activeChart.position);
        setZAxis(activeChart.zAxis); // Z axis for main indicator
        setSecondaryAxis(activeChart.xAxis); // X axis for time/product
        setYAxis(activeChart.yAxis); // Y axis for secondary indicator
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

  // Update properties of the active chart
  const updateActiveChart = (updates: Partial<Chart>) => {
    setCharts(prevCharts => 
      prevCharts.map(chart => 
        chart.id === activeChartId 
          ? { ...chart, ...updates } 
          : chart
      )
    );
    
    // Update local state if chart type is being changed
    if (updates.chartType) {
      setChartType(updates.chartType);
    }
  };
  
  // Handle position change
  const handlePositionChange = (newPosition: VRPosition) => {
    setPosition(newPosition);
    updateActiveChart({ position: newPosition });
  };
  
  // Handle Z axis change (main indicator) - use KPI ID directly
  const handleZAxisChange = (value: string) => {
    setZAxis(value);
    updateActiveChart({ zAxis: value });
  };
  
  // Handle secondary axis change (X axis - time/product)
  const handleSecondaryAxisChange = (value: string) => {
    setSecondaryAxis(value);
    updateActiveChart({ xAxis: value });
  };
  
  // Handle Y axis change (secondary indicator) - use KPI ID directly
  const handleYAxisChange = (value: string) => {
    const yAxisValue = value === "none" ? "" : value;
    setYAxis(yAxisValue);
    updateActiveChart({ yAxis: yAxisValue });
  };

  const resetConfiguration = () => {
    setChartType("bar");
    setPosition(defaultPosition);
    setZAxis("");
    setSecondaryAxis("");
    setYAxis("");
    
    // Update active chart
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
    // Parse the configuration array format
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
        // Convert back from VR format to configurator format
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
        setZAxis(activeChart.zAxis);
        setSecondaryAxis(activeChart.xAxis);
        setYAxis(activeChart.yAxis || "");
      }
    }
    
    setConfigSaved(true);
    toast.success("Configuração carregada com sucesso");
  };

  const getCurrentConfiguration = async () => {
    try {
      // Get all unique KPI IDs used in charts
      const allKpiIds: string[] = [];
      charts.forEach(chart => {
        if (chart.zAxis && !allKpiIds.includes(chart.zAxis)) {
          allKpiIds.push(chart.zAxis);
        }
        if (chart.yAxis && !allKpiIds.includes(chart.yAxis)) {
          allKpiIds.push(chart.yAxis);
        }
      });

      // Fetch histories for all unique KPIs
      const allHistories: any[] = [];
      
      for (const kpiId of allKpiIds) {
        try {
          const history = await fetchKPIValueHistory(kpiId);
          allHistories.push(...history);
        } catch (error) {
          console.error(`Error fetching history for KPI ${kpiId}:`, error);
        }
      }

      // Get KPI names
      const kpiOptions = await fetchUserKPIs();
      
      // Build unified chart configs in the exact format you specified
      const unifiedCharts = await Promise.all(
        charts.map(async (chart) => {
          let graphname = "KPIName";
          
          // Get the KPI name from zAxis (main KPI)
          if (chart.zAxis) {
            const kpi = kpiOptions.find(option => option.id === chart.zAxis);
            if (kpi) {
              graphname = kpi.name;
            }
          }

          // If both Y and Z axis are defined, combine their names
          if (chart.yAxis) {
            const yAxisKpi = kpiOptions.find(option => option.id === chart.yAxis);
            if (yAxisKpi) {
              graphname = `${graphname} / ${yAxisKpi.name}`;
            }
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

      // Return in the exact format you specified
      const unifiedConfig = [
        {
          name: "Configuração VR",
          config: {
            kpihistory: allHistories,
            charts: unifiedCharts,
            activeChartId: activeChartId
          }
        }
      ];
      
      return unifiedConfig;
    } catch (error) {
      console.error("Error getting current configuration:", error);
      throw error;
    }
  };

  const handleExportJSON = async () => {
    try {
      const config = await getCurrentConfiguration();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      console.log("Export Configuration:", JSON.stringify(config, null, 2));
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(config, null, 2)], { 
        type: 'application/json' 
      });
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

  // Auto-save configuration when launching VR
  const autoSaveConfiguration = async () => {
    try {
      const config = await getCurrentConfiguration();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const configName = `Configuração VR ${timestamp}`;
      
      // Save to localStorage for the configuration manager widget
      const savedConfigsStr = localStorage.getItem("vrDataConfigs");
      const savedConfigs = savedConfigsStr ? JSON.parse(savedConfigsStr) : [];
      
      const newConfig = {
        name: configName,
        config: config[0].config
      };
      
      const newConfigs = [newConfig, ...savedConfigs.slice(0, 9)]; // Keep only last 10
      localStorage.setItem("vrDataConfigs", JSON.stringify(newConfigs));
      
      console.log(`Configuração guardada automaticamente: ${configName}`);
      toast.success(`Configuração guardada: ${configName}`);
      return config;
    } catch (error) {
      console.error("Error auto-saving configuration:", error);
      throw error;
    }
  };

  const getConfigurationForVR = async () => {
    try {
      // Auto-save and return the unified configuration
      const config = await autoSaveConfiguration();
      return config;
    } catch (error) {
      console.error("Error getting configuration for VR:", error);
      throw error;
    }
  };

  const { chartData, loading: dataLoading } = useChartDataProcessor(zAxis, secondaryAxis, yAxis);

  // Update the data when chartData changes
  useEffect(() => {
    setData(chartData);
  }, [chartData]);

  return {
    charts,
    activeChartId,
    chartType,
    position,
    zAxis,
    secondaryAxis,
    yAxis,
    data: chartData,
    configSaved: isConfigurationValid(),
    loading: dataLoading,
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
  };
};
