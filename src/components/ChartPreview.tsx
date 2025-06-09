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
  Scatter,
  Label
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartDataProcessor } from "@/hooks/useChartDataProcessor";
import { fetchKPIById } from "@/services/kpiService";

// --- FIX 1: Custom component for rotated X-Axis labels ---
const CustomizedAxisTick = (props: any) => {
  const { x, y, payload } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666" // You can adjust this color to match your theme
        transform="rotate(-45)"
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  );
};

// Custom Tooltip Component (from previous step)
const CustomTooltip = ({ active, payload, label }: any) => {
  // ... (this component remains unchanged)
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg">
        <p className="font-bold text-gray-800">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name} : ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ChartPreviewProps {
  chartType: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
}

const ChartPreview = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewProps) => {
  // ... (all state, hooks, and functions up to renderChart remain the same)
  const [showYAxis, setShowYAxis] = useState(true);
  const [showCombined, setShowCombined] = useState(false);
  const [combinedType, setCombinedType] = useState<1 | 2>(1);
  const [zAxisByProduct, setZAxisByProduct] = useState(false);
  const [yAxisByProduct, setYAxisByProduct] = useState(false);
  
  const { kpiUnits } = useChartDataProcessor(yAxis, xAxis, zAxis);

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
      } else {
        setYAxisByProduct(false);
      }
      
      if (zAxis && zAxis !== "none") {
        try {
          const zKpiDetails = await fetchKPIById(zAxis);
          setZAxisByProduct(zKpiDetails.ByProduct);
        } catch (error) {
          console.error("Error loading Z-axis KPI details:", error);
          setZAxisByProduct(false);
        }
      } else {
        setZAxisByProduct(false);
      }
    };
    loadKPIDetails();
  }, [yAxis, zAxis]);
  
  const getDisplayData = () => {
    if (showCombined || !zAxis || zAxis === 'none') {
      return data;
    }
    const targetKpiId = showYAxis ? yAxis : zAxis;
    if (!targetKpiId) return [];
    return data.filter(item => 
      Object.keys(item).some(key => 
        key.includes(`KPI ${targetKpiId}`) && item[key] != null
      )
    );
  };

  const displayData = getDisplayData();
  
  const getFilteredDataKeys = () => {
    if (showCombined && zAxis && zAxis !== "none" && yAxis) {
      if (yAxisByProduct && zAxisByProduct) {
        if (combinedType === 1) {
          return [ `KPI ${yAxis} (Produto 1)`, `KPI ${zAxis} (Produto 1)` ].filter(key => data.some(item => key in item));
        } else {
          return [ `KPI ${yAxis} (Produto 2)`, `KPI ${zAxis} (Produto 2)` ].filter(key => data.some(item => key in item));
        }
      } else {
        return [ `KPI ${yAxis}`, `KPI ${zAxis}` ].filter(key => data.some(item => key in item));
      }
    }
    
    const targetKpiId = showYAxis ? yAxis : zAxis;
    if (!targetKpiId || targetKpiId === "none" || displayData.length === 0) {
        return [];
    }
    
    const allKeys = Object.keys(displayData[0] || {});
    
    return allKeys.filter(key => 
      key.includes(`KPI ${targetKpiId}`) && key !== "name" && key !== "originalKey"
    );
  };

  const dataKeys = getFilteredDataKeys();

  if (!displayData || displayData.length === 0 || dataKeys.length === 0) {
    const message = yAxis && xAxis 
      ? "Não há dados para a seleção atual." 
      : "Nenhum dado disponível. Configure os eixos para visualizar o gráfico.";
      
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  const getYAxisLabel = () => {
    if (showCombined && yAxis && zAxis && zAxis !== "none") {
      const yUnit = kpiUnits[yAxis] || "";
      const zUnit = kpiUnits[zAxis] || "";
      if (yUnit === zUnit) return `Valor (${yUnit})`;
      if (yUnit && zUnit) return `Valor (${yUnit}|${zUnit})`;
      return `Valor (${yUnit || zUnit})`;
    }
    const activeKpiId = showYAxis ? yAxis : zAxis;
    const unit = kpiUnits[activeKpiId];
    return unit ? `Valor (${unit})` : "Valor";
  };
  
  const renderChart = () => {
    // --- FIX 2: Check if labels should be rotated ---
    const shouldRotateLabels = displayData.length > 3;

    // --- FIX 3: Define XAxis props once for reuse ---
    const xAxisProps = {
      dataKey: "name",
      // Increase height to make space for rotated labels
      height: shouldRotateLabels ? 80 : 30,
      // Use our custom tick component if labels should be rotated
      tick: shouldRotateLabels ? <CustomizedAxisTick /> : undefined,
      // Ensure all labels are shown when rotated, otherwise let Recharts decide
      interval: shouldRotateLabels ? 0 : 'auto',
    };

    switch (chartType) {
      case "bar":
      case "cyls":
        return (
          <ResponsiveContainer width="100%" height={350}>
            {/* Increase bottom margin to prevent cutting off labels */}
            <BarChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: shouldRotateLabels ? 25 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis allowDecimals={false}>
                <Label value={getYAxisLabel()} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
              <Legend />
              {dataKeys.map((key, index) => <Bar key={key} dataKey={key} fill={colors[index % colors.length]} name={key} />)}
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: shouldRotateLabels ? 25 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis>
                <Label value={getYAxisLabel()} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }}/>
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {dataKeys.map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} name={key} />)}
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        // For pie charts, we need to transform the data differently
        const pieData = displayData.map((item, index) => {
          const dataKey = dataKeys[0]; // Use the first (and typically only) data key
          return {
            name: item.name,
            value: item[dataKey] || 0,
            fill: colors[index % colors.length]
          };
        }).filter(item => item.value > 0); // Filter out zero values

        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg">
                        <p className="font-bold text-gray-800">{data.name}</p>
                        <p style={{ color: data.color }}>
                          Valor: {data.value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: shouldRotateLabels ? 25 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* For scatter, we must also set `type="category"` */}
              <XAxis {...xAxisProps} type="category" />
              <YAxis>
                <Label value={getYAxisLabel()} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }}/>
              </YAxis>
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {dataKeys.map((key, index) => <Scatter key={key} dataKey={key} fill={colors[index % colors.length]} name={key} />)}
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-center">Tipo de gráfico não suportado</div>;
    }
  };

  const renderToggleButtons = () => {
    const hasZAxis = zAxis && zAxis !== "none";
    const bothByProduct = yAxisByProduct && zAxisByProduct;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={showYAxis && !showCombined ? "default" : "outline"} size="sm" onClick={() => {setShowYAxis(true); setShowCombined(false);}}>Y (KPI {yAxis})</Button>
        {hasZAxis && <Button variant={!showYAxis && !showCombined ? "default" : "outline"} size="sm" onClick={() => {setShowYAxis(false); setShowCombined(false);}}>Z (KPI {zAxis})</Button>}
        {hasZAxis && (bothByProduct ? (
            <>
              <Button variant={showCombined && combinedType === 1 ? "default" : "outline"} size="sm" onClick={() => {setShowCombined(true); setCombinedType(1);}}>Y/Z [1]</Button>
              <Button variant={showCombined && combinedType === 2 ? "default" : "outline"} size="sm" onClick={() => {setShowCombined(true); setCombinedType(2);}}>Y/Z [2]</Button>
            </>
          ) : ( <Button variant={showCombined ? "default" : "outline"} size="sm" onClick={() => setShowCombined(true)}>Y/Z</Button> ))
        }
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle>Pré-visualização do Gráfico</CardTitle>
          <div className="flex-shrink-0">{renderToggleButtons()}</div>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
};

export default ChartPreview;