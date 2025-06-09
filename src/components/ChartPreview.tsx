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
  
  const getFilteredDataKeys = ().
  
  const renderChart = () => {
    const shouldRotateLabels = displayData.length > 3;

    const xAxisProps = {
      dataKey: "name",
      height: shouldRotateLabels ? 80 : 30,
      tick: shouldRotateLabels ? <CustomizedAxisTick /> : undefined,
      interval: shouldRotateLabels ? 0 : 'auto',
    };

    switch (chartType) {
      // ... (bar, cyls, line cases remain unchanged)
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

      case "pie":
        const hasProduct1Data = dataKeys.some(key => key.includes('(Produto 1)'));
        const hasProduct2Data = dataKeys.some(key => key.includes('(Produto 2)'));
        const hasBothProducts = hasProduct1Data && hasProduct2Data;

        if (hasBothProducts) {
          const product1Key = dataKeys.find(key => key.includes('(Produto 1)'));
          const product2Key = dataKeys.find(key => key.includes('(Produto 2)'));
          
          if (!product1Key || !product2Key) return null;

          const pieDataProduct1 = displayData.map((item, index) => ({
            name: item.name,
            value: item[product1Key] || 0,
            fill: colors[index % colors.length],
            seriesName: product1Key,
          })).filter(item => item.value > 0);

          const pieDataProduct2 = displayData.map((item, index) => ({
            name: item.name,
            value: item[product2Key] || 0,
            fill: colors[(index + 2) % colors.length],
            seriesName: product2Key,
          })).filter(item => item.value > 0);
          
          const legendPayload = [...pieDataProduct1, ...pieDataProduct2].map(entry => ({
            value: `${entry.seriesName} - ${entry.name}`,
            type: 'square' as const,
            color: entry.fill
          }));

          return (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={pieDataProduct1} cx="50%" cy="50%" labelLine={false} label={false} innerRadius={30} outerRadius={60} fill="#8884d8" dataKey="value" name={product1Key}>
                  {pieDataProduct1.map((entry, index) => ( <Cell key={`inner-cell-${index}`} fill={entry.fill} /> ))}
                </Pie>
                <Pie data={pieDataProduct2} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} innerRadius={70} outerRadius={100} fill="#8884d8" dataKey="value" name={product2Key}>
                  {pieDataProduct2.map((entry, index) => ( <Cell key={`outer-cell-${index}`} fill={entry.fill} /> ))}
                </Pie>
                {/* --- FIX: Corrected Tooltip Content Logic --- */}
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      // `data.name` is from the <Pie name> prop (e.g., "KPI 28 (Produto 1)")
                      const seriesName = data.name; 
                      // `data.payload.name` is the original slice name (e.g., "Jun 2025")
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
                  }}
                />
                <Legend payload={legendPayload} wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          );
        } else {
          // Single pie chart logic
          const pieData = displayData.map((item, index) => {
            const dataKey = dataKeys[0];
            return {
              name: item.name,
              value: item[dataKey] || 0,
              fill: colors[index % colors.length]
            };
          }).filter(item => item.value > 0);

          return (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value" name={dataKeys[0]}>
                  {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                </Pie>
                {/* --- FIX: Also corrected Tooltip for single pie for consistency --- */}
                <Tooltip 
                  content={({ active, payload }) => {
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
                  }}
                />
                <Legend payload={pieData.map((item) => ({ value: `${dataKeys[0]} - ${item.name}`, type: 'square' as const, color: item.fill }))} wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          );
        }
      case "scatter":
        // ... (scatter case remains unchanged)
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
    // ... (This function remains unchanged)
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
