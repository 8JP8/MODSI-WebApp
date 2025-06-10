import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash } from "lucide-react";
import { Chart } from "@/types/vr-dashboard";

interface ChartSelectorProps {
  charts: Chart[];
  activeChartId: string;
  onChartSelect: (id: string) => void;
  onAddChart: () => void;
}

const ChartSelector = ({ charts, activeChartId, onChartSelect, onAddChart }: ChartSelectorProps) => {
  const [localCharts, setLocalCharts] = useState<Chart[]>(charts);

  const handleDelete = (id: string) => {
    if (localCharts.length > 1) {
      const updatedCharts = localCharts.filter((chart) => chart.id !== id);
      setLocalCharts(updatedCharts);
    }
  };

  const handleAddFallback = () => {
    if (localCharts.length === 0) {
      onAddChart();
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle>&nbsp;Gráficos ({localCharts.length})</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 group"
            onClick={() => {
              onAddChart();
              handleAddFallback();
            }}
          >
            <PlusCircle className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex flex-col p-2 space-y-1">
            {localCharts.length > 0 ? (
              localCharts.map((chart) => (
                <div key={chart.id} className="flex items-center space-x-2 mx-2">
                  <Button
                    variant="ghost"
                    className={`flex-grow flex items-center justify-start p-3 rounded-md h-auto transition-all duration-200 hover:scale-105 ${
                      activeChartId === chart.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    }`}
                    onClick={() => onChartSelect(chart.id)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{chart.chartType}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {chart.xAxis && chart.yAxis
                          ? `${chart.xAxis} | ${chart.yAxis}` +
                            (chart.zAxis ? ` | ${chart.zAxis}` : "")
                          : "Não configurado"}
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant="destructive"
                    className="p-2"
                    disabled={localCharts.length === 1}
                    onClick={() => handleDelete(chart.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum gráfico configurado.
                <br />
                Clique em "Adicionar" para começar.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSelector;