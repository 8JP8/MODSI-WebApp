
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  ScatterChart,
  Plus 
} from "lucide-react";

interface ChartTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
  onAddChart?: () => void;
}

const ChartTypeSelector = ({ selectedType, onSelect, onAddChart }: ChartTypeSelectorProps) => {
  const chartTypes = [
    { id: "bar", name: "Bar Chart", icon: BarChart3 },
    { id: "pie", name: "Pie Chart", icon: PieChart },
    { id: "line", name: "Line Chart", icon: LineChart },
    { id: "scatter", name: "Scatter Plot", icon: ScatterChart },
  ];

  return (
    <div className="vr-panel">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Chart Type</h3>
        {onAddChart && (
          <Button 
            variant="secondary" 
            onClick={onAddChart} 
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Chart</span>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {chartTypes.map((chart) => {
          const isSelected = selectedType === chart.id;
          const Icon = chart.icon;
          
          return (
            <Button
              key={chart.id}
              variant={isSelected ? "default" : "outline"}
              className={`flex flex-col items-center justify-center p-4 h-auto ${
                isSelected ? "ring-2 ring-vr-blue" : ""
              }`}
              onClick={() => onSelect(chart.id)}
            >
              <Icon className={`h-12 w-12 ${isSelected ? "text-white" : "text-vr-blue"}`} />
              <span className="mt-2">{chart.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
