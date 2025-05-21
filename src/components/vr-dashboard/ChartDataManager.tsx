
import { useState, useEffect } from "react";
import { Chart, VRPosition, defaultPosition, CHART_COLORS } from "@/types/vr-dashboard";
import { toast } from "sonner";
import { Department, KPI, fetchDepartments, fetchDepartmentKPIs, kpiToIndicator } from "@/utils/apiService";

interface ChartDataManagerProps {
  children: (props: ChartDataManagerChildProps) => React.ReactNode;
  sampleData: any;
}

export interface ChartDataManagerChildProps {
  charts: Chart[];
  activeChartId: string;
  chartType: string;
  position: VRPosition;
  xAxis: string;
  yAxis: string;
  zAxis: string;
  data: any[];
  availableIndicators: string[];
  departments: Department[];
  selectedDepartment: number;
  configSaved: boolean;
  setActiveChartId: (id: string) => void;
  setChartType: (type: string) => void;
  updateActiveChart: (updates: Partial<Chart>) => void;
  handlePositionChange: (newPosition: VRPosition) => void;
  handleXAxisChange: (value: string) => void;
  handleYAxisChange: (value: string) => void;
  handleZAxisChange: (value: string) => void;
  handleDepartmentChange: (departmentId: number) => void;
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
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);
  const [configSaved, setConfigSaved] = useState(false);
  
  // New state for API data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);
  const [departmentKPIs, setDepartmentKPIs] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch departments from API
  useEffect(() => {
    const loadDepartments = async () => {
      setIsLoading(true);
      try {
        const deptData = await fetchDepartments();
        setDepartments(deptData);
        
        // Select first department by default if available
        if (deptData.length > 0) {
          setSelectedDepartment(deptData[0].Id);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
        toast.error("Erro ao carregar departamentos");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDepartments();
    
    // Initialize with one chart
    if (charts.length === 0) {
      addNewChart();
    }
  }, []); // Run once on component mount

  // Fetch KPIs when department changes
  useEffect(() => {
    const loadDepartmentKPIs = async () => {
      if (selectedDepartment === 0) return;
      
      setIsLoading(true);
      try {
        const kpisData = await fetchDepartmentKPIs(selectedDepartment);
        setDepartmentKPIs(kpisData);
        
        // Transform KPIs to indicators
        const indicators: string[] = [];
        kpisData.forEach(kpi => {
          const kpiIndicators = kpiToIndicator(kpi);
          indicators.push(...kpiIndicators);
        });
        
        setAvailableIndicators(indicators);
        
        // Set default axes if we have indicators
        if (indicators.length >= 2) {
          setXAxis(indicators[0]);
          setYAxis(indicators[1]);
          if (indicators.length > 2) {
            setZAxis("");
          }
        }
        
        // Generate mock data based on KPIs
        generateMockDataFromKPIs(kpisData, indicators);
        
      } catch (error) {
        console.error(`Error loading KPIs for department ${selectedDepartment}:`, error);
        toast.error("Erro ao carregar KPIs do departamento");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDepartmentKPIs();
  }, [selectedDepartment]);

  // When a chart is added or selected
  useEffect(() => {
    if (activeChartId && charts.length > 0) {
      const activeChart = charts.find(chart => chart.id === activeChartId);
      if (activeChart) {
        // Update UI state based on selected chart
        setChartType(activeChart.chartType);
        setPosition(activeChart.position);
        setXAxis(activeChart.xAxis);
        setYAxis(activeChart.yAxis);
        setZAxis(activeChart.zAxis);
        
        // Load the department for this chart if it exists
        if (activeChart.departmentId) {
          setSelectedDepartment(activeChart.departmentId);
        }
      }
    }
  }, [activeChartId, charts]);

  // Generate mock data from KPIs for visualization purposes
  const generateMockDataFromKPIs = (kpis: KPI[], indicators: string[]) => {
    // Create sample data entries for visualization
    const mockData = indicators.map((indicator, index) => {
      const dataPoint: any = {};
      
      // For each indicator, add a value for every other indicator
      indicators.forEach(ind => {
        // Generate some random value for this combination
        dataPoint[ind] = Math.floor(Math.random() * 100);
      });
      
      return dataPoint;
    });
    
    setData(mockData);
  };

  // Adding a new chart
  const addNewChart = () => {
    const newChartId = `chart-${Date.now()}`;
    const colorIndex = charts.length % CHART_COLORS.length;
    
    const newChart: Chart = {
      id: newChartId,
      chartType: "bar",
      position: { ...defaultPosition },
      xAxis: availableIndicators.length > 0 ? availableIndicators[0] : "",
      yAxis: availableIndicators.length > 1 ? availableIndicators[1] : "",
      zAxis: "",
      departmentId: selectedDepartment,
      color: CHART_COLORS[colorIndex]
    };
    
    setCharts(prevCharts => [...prevCharts, newChart]);
    setActiveChartId(newChartId);
    toast.success("Novo gráfico adicionado");
  };

  // Handle department change
  const handleDepartmentChange = (departmentId: number) => {
    setSelectedDepartment(departmentId);
    
    // Update the active chart if there is one
    if (activeChartId) {
      updateActiveChart({ departmentId });
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
  
  // Handle X axis change
  const handleXAxisChange = (value: string) => {
    setXAxis(value);
    updateActiveChart({ xAxis: value });
  };
  
  // Handle Y axis change
  const handleYAxisChange = (value: string) => {
    setYAxis(value);
    updateActiveChart({ yAxis: value });
  };
  
  // Handle Z axis change
  const handleZAxisChange = (value: string) => {
    // If "none" is selected, set zAxis to empty string
    const zAxisValue = value === "none" ? "" : value;
    setZAxis(zAxisValue);
    updateActiveChart({ zAxis: zAxisValue });
  };

  const resetConfiguration = () => {
    setChartType("bar");
    setPosition(defaultPosition);
    const indicators = availableIndicators;
    if (indicators.length >= 2) {
      setXAxis(indicators[0]);
      setYAxis(indicators[1]);
      setZAxis("");
    }
    
    // Update active chart
    if (activeChartId) {
      updateActiveChart({
        chartType: "bar",
        position: { ...defaultPosition },
        xAxis: indicators.length > 0 ? indicators[0] : "",
        yAxis: indicators.length > 1 ? indicators[1] : "",
        zAxis: ""
      });
    }
    
    toast.info("Configuração restaurada aos padrões");
  };

  const handleLoadConfig = (config: any) => {
    // Handle loading a full configuration with multiple charts
    if (config.charts && Array.isArray(config.charts)) {
      // Ensure each chart has proper position properties
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
        setXAxis(firstChart.xAxis);
        setYAxis(firstChart.yAxis);
        setZAxis(firstChart.zAxis || "");
        
        if (firstChart.departmentId) {
          setSelectedDepartment(firstChart.departmentId);
        }
      }
    } else {
      // Legacy support for single chart configuration
      setChartType(config.chartType);
      setXAxis(config.xAxis);
      setYAxis(config.yAxis);
      setZAxis(config.zAxis || "");
      
      // Ensure position has all required properties
      const completePosition = {
        ...config.position,
        width: config.position.width || 1,
        height: config.position.height || 1,
        depth: config.position.depth || 1
      };
      
      setPosition(completePosition);
      
      if (config.departmentId) {
        setSelectedDepartment(config.departmentId);
      }
      
      // Update active chart
      if (activeChartId) {
        updateActiveChart({
          chartType: config.chartType,
          position: completePosition,
          xAxis: config.xAxis,
          yAxis: config.yAxis,
          zAxis: config.zAxis || "",
          departmentId: config.departmentId || selectedDepartment
        });
      }
    }
    
    setConfigSaved(true);
    toast.success("Configuração carregada com sucesso");
  };

  const handleExportJSON = () => {
    // Create export config with all charts
    const config = {
      charts: charts.map(chart => ({
        id: chart.id,
        chartType: chart.chartType,
        dataMapping: {
          xAxis: chart.xAxis,
          yAxis: chart.yAxis,
          zAxis: chart.zAxis
        },
        position: chart.position,
        departmentId: chart.departmentId,
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
    xAxis,
    yAxis,
    zAxis,
    data,
    availableIndicators,
    departments,
    selectedDepartment,
    configSaved,
    setActiveChartId,
    setChartType,
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
  });
};

export default ChartDataManager;
