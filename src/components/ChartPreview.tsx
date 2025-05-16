
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, LineChart, ScatterChart } from "recharts";
import { Bar, Pie, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

interface ChartPreviewProps {
  chartType: string;
  data: Array<any>;
  xAxis: string;
  yAxis: string;
  zAxis?: string;
}

const COLORS = ['#1E90FF', '#00CED1', '#9370DB', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const ChartPreview = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewProps) => {
  if (!data || data.length === 0 || !xAxis || !yAxis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Chart Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select data indicators to preview chart</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey={xAxis} stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
            <Legend />
            <Bar dataKey={yAxis} fill="#1E90FF" />
            {zAxis && <Bar dataKey={zAxis} fill="#9370DB" />}
          </BarChart>
        );
        
      case "pie":
        return (
          <PieChart width={500} height={300}>
            <Pie
              data={data}
              cx={250}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={yAxis}
              nameKey={xAxis}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
            <Legend />
          </PieChart>
        );
        
      case "line":
        return (
          <LineChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey={xAxis} stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
            <Legend />
            <Line type="monotone" dataKey={yAxis} stroke="#1E90FF" activeDot={{ r: 8 }} />
            {zAxis && <Line type="monotone" dataKey={zAxis} stroke="#9370DB" />}
          </LineChart>
        );
        
      case "scatter":
        return (
          <ScatterChart width={500} height={300} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey={xAxis} type="number" name={xAxis} stroke="#ccc" />
            <YAxis dataKey={yAxis} type="number" name={yAxis} stroke="#ccc" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#2A2F3C", borderColor: "#444" }} />
            <Legend />
            <Scatter name={yAxis} data={data} fill="#1E90FF" />
            {zAxis && <Scatter name={zAxis} data={data} fill="#9370DB" />}
          </ScatterChart>
        );
        
      default:
        return <p>Select a chart type</p>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Chart Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center overflow-auto">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartPreview;
