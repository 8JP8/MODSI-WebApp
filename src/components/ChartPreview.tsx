
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  ScatterChart,
  Bar, 
  Pie, 
  Line, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  ResponsiveContainer 
} from "recharts";

interface ChartPreviewProps {
  chartType: string;
  data: Array<any>;
  xAxis: string;
  yAxis: string;
  zAxis?: string;
}

const COLORS = ['#1E90FF', '#00CED1', '#9370DB', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const ChartPreview = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewProps) => {
  console.log("ChartPreview data:", { chartType, data, xAxis, yAxis, zAxis });
  
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pré-visualização do Gráfico</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">A carregar dados...</p>
            <p className="text-sm text-muted-foreground">
              Y: {zAxis || "não selecionado"}, X: {xAxis || "não selecionado"}, Z: {yAxis || "nenhum"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!xAxis || !zAxis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pré-visualização do Gráfico</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Selecione indicadores de dados para pré-visualizar o gráfico</p>
            <p className="text-sm text-muted-foreground">
              Y: {zAxis || "não selecionado"}, X: {xAxis || "não selecionado"}, Z: {yAxis || "nenhum"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get all data keys except 'name'
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name') : [];
  console.log("Available data keys:", dataKeys);

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="fill-muted-foreground text-xs" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="fill-muted-foreground text-xs" 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }} 
              />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        const pieDataKey = dataKeys[0];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={pieDataKey}
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="fill-muted-foreground text-xs" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="fill-muted-foreground text-xs" 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }} 
              />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "scatter":
        // Transform data for scatter plot - each data series becomes scatter points
        const scatterData = dataKeys.map((key, index) => ({
          data: data.map((item, itemIndex) => ({
            x: itemIndex, // Use index as x value for scatter
            y: item[key],
            name: item.name
          })),
          name: key,
          fill: COLORS[index % COLORS.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                dataKey="x"
                name="Índice" 
                className="fill-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
                domain={[0, data.length - 1]}
              />
              <YAxis 
                type="number" 
                dataKey="y"
                name="Valor"
                className="fill-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
                formatter={(value, name, props) => [
                  value,
                  `${name} (${props.payload.name})`
                ]}
              />
              <Legend />
              {scatterData.map((series) => (
                <Scatter 
                  key={series.name} 
                  name={series.name} 
                  data={series.data} 
                  fill={series.fill}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      default:
        return <p>Selecione um tipo de gráfico</p>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pré-visualização do Gráfico</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center overflow-auto">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartPreview;
