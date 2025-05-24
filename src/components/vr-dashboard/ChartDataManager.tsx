
import { useState, useEffect } from "react";
import { Chart, VRPosition, defaultPosition, CHART_COLORS } from "@/types/vr-dashboard";
import { toast } from "sonner";

interface ChartDataManagerProps {
  children: (props: ChartDataManagerChildProps) => React.ReactNode;
  sampleData: any;
}

export interface ChartDataManagerChildProps {
  charts: Chart[];
  activeChartId: string;
  chartType: string;
  position: VRPosition;
  zAxis: string;
  secondaryAxis: string;
  yAxis: string;
  data: any[];
  configSaved: boolean;
  setActiveChartId: (id: string) => void;
  setChartType: (type: string) => void;
  updateActiveChart: (updates: Partial<Chart>) => void;
  handlePositionChange: (newPosition: VRPosition) => void;
  handleZAxisChange: (value: string) => void;
  handleSecondaryAxisChange: (value: string) => void;
  handleYAxisChange: (value: string) => void;
  addNewChart: () => void;
  resetConfiguration: () => void;
  handleLoadConfig: (config: any) => void;
  handleExportJSON: () => void;
  setConfigSaved: (saved: boolean) => void;
}

const ChartDataManager = ({ children, sampleData }: ChartDataManagerProps) => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [activeChartId, setActiveChartId] = useState<string>("");
  const [chartType, setChartType] = useState("bar");
  const [position, setPosition] = useState<VRPosition>(defaultPosition);
  const [zAxis, setZAxis] = useState("");
  const [secondaryAxis, setSecondaryAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [configSaved, setConfigSaved] = useState(false);

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
        setZAxis(activeChart.xAxis); // Using xAxis for Z axis temporarily
        setSecondaryAxis(activeChart.yAxis); // Using yAxis for secondary axis temporarily
        setYAxis(activeChart.zAxis); // Using zAxis for Y axis temporarily
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
      department: "",
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
  };

  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    setChartType(type);
    updateActiveChart({ chartType: type });
  };
  
  // Handle position change
  const handlePositionChange = (newPosition: VRPosition) => {
    setPosition(newPosition);
    updateActiveChart({ position: newPosition });
  };
  
  // Handle Z axis change
  const handleZAxisChange = (value: string) => {
    setZAxis(value);
    updateActiveChart({ xAxis: value }); // Temporarily using xAxis
  };
  
  // Handle secondary axis change
  const handleSecondaryAxisChange = (value: string) => {
    setSecondaryAxis(value);
    updateActiveChart({ yAxis: value }); // Temporarily using yAxis
  };
  
  // Handle Y axis change
  const handleYAxisChange = (value: string) => {
    const yAxisValue = value === "none" ? "" : value;
    setYAxis(yAxisValue);
    updateActiveChart({ zAxis: yAxisValue }); // Temporarily using zAxis
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
    // Handle loading a full configuration with multiple charts
    if (config.charts && Array.isArray(config.charts)) {
      const completeCharts = config.charts.map((chart: any) => ({
        ...chart,
        position: {
          ...chart.position,
          width: chart.position.width || 1,
          height: chart.position.height || 1,
          depth: chart.position.depth || 1
        }
      }));
      
      setCharts(completeCharts);
      
      if (completeCharts.length > 0) {
        setActiveChartId(completeCharts[0].id);
        const firstChart = completeCharts[0];
        setChartType(firstChart.chartType);
        setPosition(firstChart.position);
        setZAxis(firstChart.xAxis);
        setSecondaryAxis(firstChart.yAxis);
        setYAxis(firstChart.zAxis || "");
      }
    }
    
    setConfigSaved(true);
    toast.success("Configuração carregada com sucesso");
  };

  const handleExportJSON = () => {
    const config = {
      charts: charts.map(chart => ({
        id: chart.id,
        chartType: chart.chartType,
        dataMapping: {
          zAxis: chart.xAxis,
          secondaryAxis: chart.yAxis,
          yAxis: chart.zAxis
        },
        position: chart.position,
        color: chart.color
      }))
    };
    
    console.log("Export Configuration:", JSON.stringify(config, null, 2));
    toast.success("Configuração exportada para o console");
    setConfigSaved(true);
  };

  return children({
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
    setChartType,
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
  });
};

export default ChartDataManager;
