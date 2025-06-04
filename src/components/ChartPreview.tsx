
import { useState } from "react";
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

interface ChartPreviewProps {
  chartType: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
}

const ChartPreview = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewProps) => {
  const [showZAxis, setShowZAxis] = useState(true); // Toggle between Y and Z axis data

  console.log("ChartPreview: Received props:", { chartType, data, xAxis, yAxis, zAxis });

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

  // Determine which axis data to show
  const activeAxisId = showZAxis ? zAxis : yAxis;
  const activeAxisName = showZAxis ? "Z" : "Y";
  
  // Filter data keys based on the active axis
  const getFilteredDataKeys = () => {
    if (!activeAxisId) return [];
    
    const allKeys = Object.keys(data[0] || {});
    return allKeys.filter(key => 
      key.includes(`KPI ${activeAxisId}`) && key !== "name"
    );
  };

  const dataKeys = getFilteredDataKeys();
  
  // Colors for different series
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
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
              <YAxis />
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
              <YAxis />
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

  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Pré-visualização do Gráfico</CardTitle>
          {yAxis && zAxis && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar eixo:</span>
              <Button
                variant={showZAxis ? "default" : "outline"}
                size="sm"
                onClick={() => setShowZAxis(true)}
                className="transition-transform duration-200 hover:scale-105"
              >
                Z (KPI {zAxis})
              </Button>
              <Button
                variant={!showZAxis ? "default" : "outline"}
                size="sm"
                onClick={() => setShowZAxis(false)}
                className="transition-transform duration-200 hover:scale-105"
              >
                Y (KPI {yAxis})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartPreview;
