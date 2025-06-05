
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  ScatterChart,
  ChartColumnBig
} from "lucide-react";

interface ChartTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

const ChartTypeSelector = ({ selectedType, onSelect }: ChartTypeSelectorProps) => {
  const chartTypes = [
    { id: "bar", name: "babia-bars", icon: BarChart3, disabled: false },
    { id: "cyls", name: "babia-cyls", icon: ChartColumnBig, disabled: false },
    { id: "pie", name: "babia-pie", icon: PieChart, disabled: false },
    // { id: "line", name: "linha", icon: LineChart, disabled: true }, // Commented out as requested
    { id: "scatter", name: "babia-bubbles", icon: ScatterChart, disabled: false },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {chartTypes.map((chart) => {
          const isSelected = selectedType === chart.id;
          const Icon = chart.icon;
          
          return (
            <Button
              key={chart.id}
              variant={isSelected ? "default" : "outline"}
              className={`flex flex-col items-center justify-center p-4 h-auto transition-all duration-200 hover:scale-105 ${
                isSelected ? "ring-2 ring-vr-blue" : ""
              } ${chart.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !chart.disabled && onSelect(chart.id)}
              disabled={chart.disabled}
            >
              <Icon className={`h-12 w-12 transition-transform duration-200 hover:rotate-12 ${isSelected ? "text-white" : "text-vr-blue"}`} />
              <span className="mt-2">{chart.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
