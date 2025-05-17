
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DataIndicatorSelector from "./DataIndicatorSelector";
import VRPositionController from "./VRPositionController";
import ChartPreview from "./ChartPreview";
import VRScenePreview from "./VRScenePreview";
import ConfigurationManager from "./ConfigurationManager";
import VRLaunchDialog from "./VRLaunchDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Play, Eye, Settings2, Save, ArrowLeft, Plus } from "lucide-react";
import { generateMockData, getAvailableDataIndicators } from "@/utils/mockData";
import sampleData from "../data/sampleVisualization.json";

interface VRPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  width: number;
  height: number;
  depth: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

interface Chart {
  id: string;
  chartType: string;
  position: VRPosition;
  xAxis: string;
  yAxis: string;
  zAxis: string;
  department: string;
  color: string;
}

const defaultPosition: VRPosition = {
  x: 0,
  y: 1,
  z: -2,
  scale: 1,
  width: 1,
  height: 1, 
  depth: 1,
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
};

// Chart colors
const CHART_COLORS = [
  "#1E90FF", "#FF6384", "#4BC0C0", "#9370DB", 
  "#FF9F40", "#36A2EB", "#FFCE56", "#9966FF"
];

const VRDashboard = () => {
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
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  
  // Departments
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Initialize data on component mount
  useEffect(() => {
    // Load sample data departments
    const deptNames = sampleData.departments.map(dept => dept.name);
    setDepartments(deptNames);
    
    if (deptNames.length > 0) {
      setSelectedDepartment(deptNames[0]);
      loadDepartmentData(deptNames[0]);
    }

    // Initialize with one chart
    addNewChart();
  }, []);

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
    const departmentData = sampleData.departments.find(dept => dept.name === departmentName);
    
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
    toast.success("New chart added");
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
    
    toast.info("Configuration reset to defaults");
  };

  const handleLoadConfig = (config: any) => {
    // Handle loading a full configuration with multiple charts
    if (config.charts && Array.isArray(config.charts)) {
      setCharts(config.charts);
      if (config.charts.length > 0) {
        setActiveChartId(config.charts[0].id);
        const firstChart = config.charts[0];
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
      setPosition(config.position);
      
      if (config.department) {
        handleDepartmentChange(config.department);
      }
      
      // Update active chart
      if (activeChartId) {
        updateActiveChart({
          chartType: config.chartType,
          position: config.position,
          xAxis: config.xAxis,
          yAxis: config.yAxis,
          zAxis: config.zAxis || "",
          department: config.department || selectedDepartment
        });
      }
    }
    
    setConfigSaved(true);
    toast.success("Configuration loaded successfully");
  };

  const handleImportJSON = () => {
    // In a real app, this would open a file dialog
    // For this demo, we'll simulate loading the sample
    
    // Import multiple charts
    const chartConfigs = sampleData.charts.map(chart => ({
      id: `chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      chartType: chart.type,
      xAxis: chart.dataMapping.xAxis,
      yAxis: chart.dataMapping.yAxis,
      zAxis: chart.dataMapping.zAxis || "",
      department: chart.department,
      position: chart.position,
      color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)]
    }));
    
    setCharts(chartConfigs);
    if (chartConfigs.length > 0) {
      setActiveChartId(chartConfigs[0].id);
    }
    
    toast.success("Configuration imported successfully");
    setConfigSaved(true);
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
    toast.success("Configuration exported to console");
    setConfigSaved(true);
  };

  const joinVisualization = (roomCode: string) => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    
    toast.success(`Joining visualization room: ${roomCode}`);
    setConfigSaved(true);
    setLaunchDialogOpen(false);
  };

  const launchVR = () => {
    // This would be integrated with A-Frame/BabiaXR in a full implementation
    toast.success("VR scene configuration saved! Ready to launch VR experience.");
    
    // In a real app, we would either:
    // 1. Navigate to a VR scene page
    // 2. Launch a VR experience in a new window/tab
    // 3. Initialize A-Frame in the current page
    console.log("Launching VR with configuration:", {
      charts
    });
    
    setLaunchDialogOpen(false);
  };

  const saveConfigurationHandler = () => {
    handleExportJSON();
    setConfigSaved(true);
  };

  const handleLaunchButtonClick = () => {
    setLaunchDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold vr-gradient-text">VR Data Visualization Configurator</h1>
            <p className="text-muted-foreground mt-2">
              Configure your VR data visualization experience
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={saveConfigurationHandler}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button 
            className="vr-button" 
            onClick={handleLaunchButtonClick} 
            disabled={!configSaved}
          >
            <Play className="mr-2 h-4 w-4" />
            Launch VR Experience
          </Button>
          <div className="flex items-center gap-2 ml-2 border-l pl-3 border-gray-600">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1535268647677-300dbf3d78d1" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden md:inline">Logged as <span className="font-medium text-foreground">User*</span></span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Chart and data configuration */}
        <div className="space-y-6">
          {/* Chart Selection */}
          {charts.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Chart</CardTitle>
                <Button 
                  variant="secondary" 
                  onClick={addNewChart} 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Chart</span>
                </Button>
              </CardHeader>
              <CardContent>
                <Select 
                  value={activeChartId} 
                  onValueChange={setActiveChartId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chart" />
                  </SelectTrigger>
                  <SelectContent>
                    {charts.map((chart, index) => (
                      <SelectItem key={chart.id} value={chart.id}>
                        Chart {index + 1} ({chart.chartType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
          
          <DataIndicatorSelector
            availableIndicators={availableIndicators}
            onSelectXAxis={handleXAxisChange}
            onSelectYAxis={handleYAxisChange}
            onSelectZAxis={handleZAxisChange}
            selectedX={xAxis}
            selectedY={yAxis}
            selectedZ={zAxis}
            chartType={chartType}
            onSelectChartType={handleChartTypeChange}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={handleDepartmentChange}
          />
        </div>
        
        {/* Middle column - Previews */}
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="preview">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Chart Preview
              </TabsTrigger>
              <TabsTrigger value="vr">
                <Settings2 className="mr-2 h-4 w-4" />
                VR Scene
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-4">
              <ChartPreview 
                chartType={chartType} 
                data={data} 
                xAxis={xAxis} 
                yAxis={yAxis} 
                zAxis={zAxis} 
              />
            </TabsContent>
            
            <TabsContent value="vr" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <VRScenePreview 
                    chartType={chartType} 
                    position={position} 
                    charts={charts}
                    activeChartId={activeChartId}
                  />
                </div>
                <div>
                  <VRPositionController 
                    position={position} 
                    onPositionChange={handlePositionChange} 
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <ConfigurationManager
            currentConfig={{ 
              charts,
              activeChartId
            }}
            onLoadConfig={handleLoadConfig}
            onResetConfig={resetConfiguration}
            onSaveConfig={saveConfigurationHandler}
          />
        </div>
      </div>

      {/* VR Launch Dialog */}
      <VRLaunchDialog
        open={launchDialogOpen}
        onOpenChange={setLaunchDialogOpen}
        onLaunch={launchVR}
        onJoin={joinVisualization}
        hasUnsavedChanges={!configSaved}
      />
    </div>
  );
};

export default VRDashboard;
