
import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartDataProcessor } from "@/hooks/useChartDataProcessor";
import { fetchKPIById } from "@/services/kpiService";

interface ChartPreviewProps {
  chartType: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
}

const ChartPreview = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewProps) => {
  const [showZAxis, setShowZAxis] = useState(true); // Toggle between Y and Z axis data
  const [showCombined, setShowCombined] = useState(false); // New toggle for Y/Z combined view
  const [combinedType, setCombinedType] = useState<1 | 2>(1); // For Y/Z [1] and Y/Z [2]
  const [zAxisByProduct, setZAxisByProduct] = useState(false);
  const [yAxisByProduct, setYAxisByProduct] = useState(false);
  
  const { kpiUnits } = useChartDataProcessor(yAxis, xAxis, zAxis);

  console.log("ChartPreview: Received props:", { chartType, data, xAxis, yAxis, zAxis });

  // Load ByProduct info for both KPIs
  useEffect(() => {
    const loadKPIDetails = async () => {
      if (yAxis) {
        try {
          const yKpiDetails = await fetchKPIById(yAxis);
          setYAxisByProduct(yKpiDetails.ByProduct);
        } catch (error) {
          console.error("Error loading Y-axis KPI details:", error);
          setYAxisByProduct(false);
        }
      }
      
      if (zAxis && zAxis !== "none") {
        try {
          const zKpiDetails = await fetchKPIById(zAxis);
          setZAxisByProduct(zKpiDetails.ByProduct);
        } catch (error) {
          console.error("Error loading Z-axis KPI details:", error);
          setZAxisByProduct(false);
        }
      }
    };

    loadKPIDetails();
  }, [yAxis, zAxis]);

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">
            Nenhum dado disponível. Configure os eixos para visualizar o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Determine which axis data to show - isolate individual views properly
  const getFilteredDataKeys = () => {
    if (showCombined && zAxis && zAxis !== "none" && yAxis) {
      // Show specific series based on combinedType for ByProduct KPIs
      if (yAxisByProduct && zAxisByProduct) {
        if (combinedType === 1) {
          return [
            `KPI ${yAxis} (Produto 1)`,
            `KPI ${zAxis} (Produto 1)`
          ].filter(key => data.some(item => key in item));
        } else {
          return [
            `KPI ${yAxis} (Produto 2)`,
            `KPI ${zAxis} (Produto 2)`
          ].filter(key => data.some(item => key in item));
        }
      } else {
        // Regular combined view for non-ByProduct KPIs
        return [
          `KPI ${yAxis}`,
          `KPI ${zAxis}`
        ].filter(key => data.some(item => key in item));
      }
    }
    
    // Individual KPI view - only show the selected KPI's data
    const targetKpiId = showZAxis ? yAxis : zAxis;
    if (!targetKpiId || targetKpiId === "none") return [];
    
    const allKeys = Object.keys(data[0] || {});
    return allKeys.filter(key => 
      key.includes(`KPI ${targetKpiId}`) && key !== "name" && key !== "originalKey"
    );
  };

  const dataKeys = getFilteredDataKeys();
  
  // Colors for different series
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  // Get the unit for Y-axis label
  const getYAxisLabel = () => {
    if (showCombined && yAxis && zAxis && zAxis !== "none") {
      const yUnit = kpiUnits[yAxis] || "";
      const zUnit = kpiUnits[zAxis] || "";
      
      if (yUnit && zUnit) {
        return `Valor (${yUnit} | ${zUnit})`;
      } else if (yUnit || zUnit) {
        return `Valor (${yUnit || zUnit})`;
      } else {
        return "Valor";
      }
    }
    
    const activeKpiId = showZAxis ? yAxis : zAxis;
    const unit = kpiUnits[activeKpiId];
    return unit ? `Valor (${unit})` : "Valor";
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
      case "cyls": // Use bar chart for cyls type as well
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]} 
                  name={key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        // For pie charts, aggregate the data
        const pieData = dataKeys.flatMap((key, keyIndex) => 
          data.map((item, itemIndex) => ({
            name: `${item.name} - ${key}`,
            value: item[key] || 0,
            fill: colors[(keyIndex * data.length + itemIndex) % colors.length]
          }))
        ).filter(item => item.value > 0);

        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Scatter 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]}
                  name={key}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center">Tipo de gráfico não suportado</div>;
    }
  };

  const renderToggleButtons = () => {
    if (!zAxis || zAxis === "none") return null;

    const bothByProduct = yAxisByProduct && zAxisByProduct;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={showZAxis && !showCombined ? "default" : "outline"}
          size="sm"
          onClick={() => {setShowZAxis(true); setShowCombined(false);}}
          className="transition-transform duration-200 hover:scale-105"
        >
          Y (KPI {yAxis})
        </Button>
        <Button
          variant={!showZAxis && !showCombined ? "default" : "outline"}
          size="sm"
          onClick={() => {setShowZAxis(false); setShowCombined(false);}}
          className="transition-transform duration-200 hover:scale-105"
        >
          Z (KPI {zAxis})
        </Button>
        
        {bothByProduct ? (
          <>
            <Button
              variant={showCombined && combinedType === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => {setShowCombined(true); setCombinedType(1);}}
              className="transition-transform duration-200 hover:scale-105"
            >
              Y/Z [1]
            </Button>
            <Button
              variant={showCombined && combinedType === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => {setShowCombined(true); setCombinedType(2);}}
              className="transition-transform duration-200 hover:scale-105"
            >
              Y/Z [2]
            </Button>
          </>
        ) : (
          <Button
            variant={showCombined ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCombined(true)}
            className="transition-transform duration-200 hover:scale-105"
          >
            Y/Z
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle>Pré-visualização do Gráfico</CardTitle>
          <div className="flex-shrink-0">
            {renderToggleButtons()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartPreview;
