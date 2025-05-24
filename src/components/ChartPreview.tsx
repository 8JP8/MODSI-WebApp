
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, LineChart, ScatterChart } from "recharts";
import { Bar, Pie, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";

interface ChartPreviewProps {
  chartType: string;
  data: Array<any>;
  xAxis: string;
  yAxis: string;
  zAxis?: string;
}

const COLORS = ['#1E90FF', '#00CED1', '#9370DB', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const ChartPreview = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewProps) => {
  if (!data || data.length === 0 || !xAxis || !zAxis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pré-visualização do Gráfico</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Selecione indicadores de dados para pré-visualizar o gráfico</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={xAxis} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
              <Legend />
              <Bar dataKey={zAxis} fill="#1E90FF" />
              {yAxis && <Bar dataKey={yAxis} fill="#9370DB" />}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "pie":
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
                dataKey={zAxis}
                nameKey={xAxis}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={xAxis} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
              <Legend />
              <Line type="monotone" dataKey={zAxis} stroke="#1E90FF" activeDot={{ r: 8 }} />
              {yAxis && <Line type="monotone" dataKey={yAxis} stroke="#9370DB" />}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={xAxis} type="number" name={xAxis} stroke="#ccc" />
              <YAxis dataKey={zAxis} type="number" name={zAxis} stroke="#ccc" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
              <Legend />
              <Scatter name={zAxis} data={data} fill="#1E90FF" />
              {yAxis && <Scatter name={yAxis} data={data} fill="#9370DB" />}
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
