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

// --- Custom component for rotated X-Axis labels ---
const CustomizedAxisTick = (props: any) => {
  const { x, y, payload } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-45)" fontSize={12} >
        {payload.value}
      </text>
    </g>
  );
};

// Custom Tooltip Component (for Bar/Line/Scatter charts)
const CustomTooltip = ({ active, payload, label }: any) => {
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

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#dd88dd"];
  
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
    const shouldRotateLabels = displayData.length > 3;

    const xAxisProps = {
      dataKey: "name",
      height: shouldRotateLabels ? 80 : 30,
      tick: shouldRotateLabels ? <CustomizedAxisTick /> : undefined,
      interval: shouldRotateLabels ? 0 : 'auto',
    };

    switch (chartType) {
      case "bar":
      case "cyls":
        return (
          <ResponsiveContainer width="100%" height={350}>
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

      // --- START: Rigorously Re-implemented Pie Chart Logic ---
      case "pie": {
        const product1Key = dataKeys.find(key => key.includes('(Produto 1)'));
        const product2Key = dataKeys.find(key => key.includes('(Produto 2)'));

        const pieDataProduct1 = product1Key
          ? displayData.map((item, index) => ({
              name: item.name,
              value: item[product1Key] || 0,
              fill: colors[index % colors.length],
            })).filter(item => item.value > 0)
          : [];

        const pieDataProduct2 = product2Key
          ? displayData.map((item, index) => ({
              name: item.name,
              value: item[product2Key] || 0,
              fill: colors[(index + 2) % colors.length],
            })).filter(item => item.value > 0)
          : [];

        const hasProduct1Data = pieDataProduct1.length > 0;
        const hasProduct2Data = pieDataProduct2.length > 0;

        // Tooltip renderer is now universal for all pie charts
        const renderPieTooltip = ({ active, payload }: any) => {
          if (active && payload && payload.length) {
            const data = payload[0];
            const seriesName = data.name; 
            const categoryName = data.payload.name;
            
            return (
              <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg">
                <p className="font-bold text-gray-800">{categoryName}</p>
                <p style={{ color: data.payload.fill }}>
                  {`${seriesName}: ${data.value}`}
                </p>
              </div>
            );
          }
          return null;
        };

        // Case 1: Nested Pie Chart (Both products have data)
        if (hasProduct1Data && hasProduct2Data && product1Key && product2Key) {
          return (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={pieDataProduct1} dataKey="value" name={product1Key} cx="50%" cy="50%" outerRadius={60} innerRadius={30} label={false} labelLine={false}>
                  {pieDataProduct1.map(entry => <Cell key={`cell-${entry.name}-p1`} fill={entry.fill} />)}
                </Pie>
                <Pie data={pieDataProduct2} dataKey="value" name={product2Key} cx="50%" cy="50%" outerRadius={100} innerRadius={70} label={false} labelLine={false}>
                  {pieDataProduct2.map(entry => <Cell key={`cell-${entry.name}-p2`} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={renderPieTooltip} />
                <Legend payload={[...pieDataProduct1.map(e => ({ value: `${product1Key} - ${e.name}`, type: 'square' as const, color: e.fill })), ...pieDataProduct2.map(e => ({ value: `${product2Key} - ${e.name}`, type: 'square' as const, color: e.fill }))]} wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          );
        }

        // Case 2: Single Pie Chart (Only one product has data OR it's a non-product KPI)
        let singlePieData: any[] = [];
        let singleDataKey = '';

        if (hasProduct1Data && product1Key) {
          singlePieData = pieDataProduct1;
          singleDataKey = product1Key;
        } else if (hasProduct2Data && product2Key) {
          singlePieData = pieDataProduct2;
          singleDataKey = product2Key;
        } else if (dataKeys.length > 0) {
          // This handles the non-ByProduct case
          singleDataKey = dataKeys[0];
          singlePieData = displayData.map((item, index) => ({
            name: item.name,
            value: item[singleDataKey] || 0,
            fill: colors[index % colors.length]
          })).filter(item => item.value > 0);
        }

        if (singlePieData.length > 0 && singleDataKey) {
          return (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={singlePieData} dataKey="value" name={singleDataKey} cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {singlePieData.map(entry => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={renderPieTooltip} />
                <Legend payload={singlePieData.map(e => ({ value: `${singleDataKey} - ${e.name}`, type: 'square' as const, color: e.fill }))} wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          );
        }

        // Fallback if no pie data can be shown
        return <div className="text-center">Não há dados de pizza para exibir.</div>;
      }
      // --- END: Re-implemented Pie Chart Logic ---

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: shouldRotateLabels ? 25 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
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
