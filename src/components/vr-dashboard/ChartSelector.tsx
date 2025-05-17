
import { Chart } from "@/types/vr-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ChartSelectorProps {
  charts: Chart[];
  activeChartId: string;
  onChartSelect: (id: string) => void;
  onAddChart: () => void;
}

const ChartSelector = ({ charts, activeChartId, onChartSelect, onAddChart }: ChartSelectorProps) => {
  if (charts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gráfico Ativo</CardTitle>
        <Button 
          variant="secondary" 
          onClick={onAddChart} 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Gráfico</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Select 
          value={activeChartId} 
          onValueChange={onChartSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um gráfico" />
          </SelectTrigger>
          <SelectContent>
            {charts.map((chart, index) => (
              <SelectItem key={chart.id} value={chart.id}>
                Gráfico {index + 1} ({chart.chartType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default ChartSelector;
