
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
  xAxis: string;
  yAxis: string;
  zAxis: string;
  data: any[];
  availableIndicators: string[];
  departments: string[];
  selectedDepartment: string;
  configSaved: boolean;
  setActiveChartId: (id: string) => void;
  setChartType: (type: string) => void;
  updateActiveChart: (updates: Partial<Chart>) => void;
  handlePositionChange: (newPosition: VRPosition) => void;
  handleXAxisChange: (value: string) => void;
  handleYAxisChange: (value: string) => void;
  handleZAxisChange: (value: string) => void;
  handleDepartmentChange: (department: string) => void;
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
  const [dataSource, setDataSource] = useState("sales");
  const [position, setPosition] = useState<VRPosition>(defaultPosition);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);
  const [availableDatasets, setAvailableDatasets] = useState<Record<string, any[]>>({});
  const [configSaved, setConfigSaved] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Initialize data on component mount
  useEffect(() => {
    // Load sample data departments
    const deptNames = sampleData.departments.map((dept: any) => dept.name);
    setDepartments(deptNames);
    
    if (deptNames.length > 0) {
      setSelectedDepartment(deptNames[0]);
      loadDepartmentData(deptNames[0]);
    }

    // Initialize with one chart
    addNewChart();
  }, [sampleData]);

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
        setSelectedDepartment(activeChart.department);
        
        // Load the department data for this chart
        if (activeChart.department) {
          loadDepartmentData(activeChart.department);
        }
      }
    }
  }, [activeChartId, charts]);

  // Load department data
  const loadDepartmentData = (departmentName: string) => {
    const departmentData = sampleData.departments.find((dept: any) => dept.name === departmentName);
    
    if (departmentData) {
      setData(departmentData.data);
      
      // Set available indicators based on the first data item
      if (departmentData.data.length > 0) {
        const indicators = Object.keys(departmentData.data[0]);
        setAvailableIndicators(indicators);
        
        // Set default axes
        if (indicators.length >= 2) {
          setXAxis(indicators[0]);
          setYAxis(indicators[1]);
          if (indicators.length > 2) {
            setZAxis("");
          }
        }
      }
    }
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
      department: selectedDepartment,
      color: CHART_COLORS[colorIndex]
    };
    
    setCharts(prevCharts => [...prevCharts, newChart]);
    setActiveChartId(newChartId);
    toast.success("Novo gráfico adicionado");
  };

  // Handle department change
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    loadDepartmentData(department);
    
    // Update the active chart if there is one
    if (activeChartId) {
      updateActiveChart({ department });
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

  // Handle data source change
  useEffect(() => {
    if (availableDatasets[dataSource]) {
      const newData = availableDatasets[dataSource];
      setData(newData);
      
      // Update available indicators
      if (newData.length > 0) {
        const indicators = Object.keys(newData[0]);
        setAvailableIndicators(indicators);
        
        // Reset axes
        if (indicators.length >= 2) {
          setXAxis(indicators[0]);
          setYAxis(indicators[1]);
          setZAxis("");
        }
      }
    }
  }, [dataSource, availableDatasets]);

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
        setSelectedDepartment(firstChart.department);
        
        if (firstChart.department) {
          loadDepartmentData(firstChart.department);
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
      
      if (config.department) {
        handleDepartmentChange(config.department);
      }
      
      // Update active chart
      if (activeChartId) {
        updateActiveChart({
          chartType: config.chartType,
          position: completePosition,
          xAxis: config.xAxis,
          yAxis: config.yAxis,
          zAxis: config.zAxis || "",
          department: config.department || selectedDepartment
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
        department: chart.department,
        color: chart.color
      }))
    };
    
    // In a real app, this would trigger a download
    // For this demo, we'll just show the JSON in the console
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
