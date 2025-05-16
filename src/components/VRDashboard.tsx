
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Play, Eye, Settings2, Upload, Save } from "lucide-react";
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
  const [chartType, setChartType] = useState("bar");
  const [dataSource, setDataSource] = useState("sales");
  const [position, setPosition] = useState<VRPosition>(defaultPosition);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);
  const [availableDatasets, setAvailableDatasets] = useState<Record<string, any[]>>({});
  
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
  }, []);

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

  // Handle department change
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    loadDepartmentData(department);
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
  };

  const handleZAxisChange = (value: string) => {
    // If "none" is selected, set zAxis to empty string
    setZAxis(value === "none" ? "" : value);
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
  };

  const launchVR = () => {
    // This would be integrated with A-Frame/BabiaXR in a full implementation
    toast.success("VR scene configuration saved! Ready to launch VR experience.");
    
    // In a real app, we would either:
    // 1. Navigate to a VR scene page
    // 2. Launch a VR experience in a new window/tab
    // 3. Initialize A-Frame in the current page
    console.log("Launching VR with configuration:", {
      chartType,
      data,
      position,
      axes: { x: xAxis, y: yAxis, z: zAxis }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold vr-gradient-text">VR Data Visualization Configurator</h1>
          <p className="text-muted-foreground mt-2">
            Configure your VR data visualization experience
          </p>
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
          <Button className="vr-button" onClick={launchVR}>
            <Play className="mr-2 h-4 w-4" />
            Launch VR Experience
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Chart and data configuration */}
        <div className="space-y-6">
          <ChartTypeSelector selectedType={chartType} onSelect={setChartType} />
          
          <DataIndicatorSelector
            availableIndicators={availableIndicators}
            onSelectXAxis={setXAxis}
            onSelectYAxis={setYAxis}
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
                  <VRScenePreview chartType={chartType} position={position} />
                </div>
                <div>
                  <VRPositionController position={position} onPositionChange={setPosition} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <ConfigurationManager
            currentConfig={{ chartType, xAxis, yAxis, zAxis, position }}
            onLoadConfig={handleLoadConfig}
            onResetConfig={resetConfiguration}
          />
        </div>
      </div>
    </div>
  );
};

export default VRDashboard;
