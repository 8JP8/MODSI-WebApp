
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  ScatterChart
} from "lucide-react";

interface ChartTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

const ChartTypeSelector = ({ selectedType, onSelect }: ChartTypeSelectorProps) => {
  const chartTypes = [
    { id: "bar", name: "Barras", icon: BarChart3 },
    { id: "pie", name: "Circular", icon: PieChart },
    { id: "line", name: "Linhas", icon: LineChart },
    { id: "scatter", name: "Dispersão", icon: ScatterChart },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tipo de Gráfico</h3>
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
