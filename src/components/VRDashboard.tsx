
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ChartTypeSelector from "./ChartTypeSelector";
import DataIndicatorSelector from "./DataIndicatorSelector";
import VRPositionController from "./VRPositionController";
import ChartPreview from "./ChartPreview";
import VRScenePreview from "./VRScenePreview";
import ConfigurationManager from "./ConfigurationManager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Play, Eye, Settings2, Upload, Save, ArrowLeft, Lock, Home, UserCircle2 } from "lucide-react";
import { generateMockData, getAvailableDataIndicators } from "@/utils/mockData";
import sampleData from "../data/sampleVisualization.json";

interface VRPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
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
}

const defaultPosition: VRPosition = {
  x: 0,
  y: 1,
  z: -2,
  scale: 1,
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
};

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
  const [roomCode, setRoomCode] = useState("");
  const [configSaved, setConfigSaved] = useState(false);
  
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
    const newChart: Chart = {
      id: newChartId,
      chartType: "bar",
      position: { ...defaultPosition },
      xAxis: availableIndicators.length > 0 ? availableIndicators[0] : "",
      yAxis: availableIndicators.length > 1 ? availableIndicators[1] : "",
      zAxis: "",
      department: selectedDepartment
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
    
    setConfigSaved(true);
  };

  const handleImportJSON = () => {
    // In a real app, this would open a file dialog
    // For this demo, we'll simulate loading the sample
    const sampleConfig = sampleData.charts[0];
    
    toast.success("Configuration imported successfully");
    handleLoadConfig({
      chartType: sampleConfig.type,
      xAxis: sampleConfig.dataMapping.xAxis,
      yAxis: sampleConfig.dataMapping.yAxis,
      zAxis: sampleConfig.dataMapping.zAxis,
      position: sampleConfig.position,
      department: sampleConfig.department
    });
    
    setConfigSaved(true);
  };
  
  const handleExportJSON = () => {
    // Create export config
    const config = {
      chartType,
      dataMapping: {
        xAxis,
        yAxis,
        zAxis
      },
      position,
      department: selectedDepartment
    };
    
    // In a real app, this would trigger a download
    // For this demo, we'll just show the JSON in the console
    console.log("Export Configuration:", JSON.stringify(config, null, 2));
    toast.success("Configuration exported to console");
    setConfigSaved(true);
  };

  const joinVisualization = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    
    toast.success(`Joining visualization room: ${roomCode}`);
    setConfigSaved(true);
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
  };

  const saveConfigurationHandler = () => {
    handleExportJSON();
    setConfigSaved(true);
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
          <Button variant="outline" onClick={handleExportJSON}>
            <Save className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportJSON}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button 
            className="vr-button" 
            onClick={launchVR} 
            disabled={!configSaved}
          >
            {configSaved ? (
              <Play className="mr-2 h-4 w-4" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Launch VR Experience
          </Button>
        </div>
      </div>

      {/* Room join section */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center max-w-xs">
          <Input 
            placeholder="Enter room code to join" 
            value={roomCode} 
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <Button onClick={joinVisualization}>Join</Button>
        </div>
        <Button variant="secondary" onClick={addNewChart}>
          <Plus className="mr-2 h-4 w-4" />
          Add Chart
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Chart and data configuration */}
        <div className="space-y-6">
          {/* Chart Selection */}
          {charts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Chart</CardTitle>
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
          
          <ChartTypeSelector selectedType={chartType} onSelect={handleChartTypeChange} />
          
          <DataIndicatorSelector
            availableIndicators={availableIndicators}
            onSelectXAxis={handleXAxisChange}
            onSelectYAxis={handleYAxisChange}
            onSelectZAxis={handleZAxisChange}
            selectedX={xAxis}
            selectedY={yAxis}
            selectedZ={zAxis}
            chartType={chartType}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <VRScenePreview 
                    chartType={chartType} 
                    position={position} 
                    charts={charts}
                    activeChartId={activeChartId}
                  />
                </div>
                <div>
                  <VRPositionController position={position} onPositionChange={handlePositionChange} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <ConfigurationManager
            currentConfig={{ chartType, xAxis, yAxis, zAxis, position }}
            onLoadConfig={handleLoadConfig}
            onResetConfig={resetConfiguration}
            onSaveConfig={saveConfigurationHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default VRDashboard;
