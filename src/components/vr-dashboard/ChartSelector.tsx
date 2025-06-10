import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Chart } from "@/types/vr-dashboard";

interface ChartSelectorProps {
  charts: Chart[];
  activeChartId: string;
  onChartSelect: (id: string) => void;
  onAddChart: () => void;
  onDeleteChart: (id:string) => void; // FIX: Prop now expects the ID of the chart to delete
}

const ChartSelector = ({
  charts,
  activeChartId,
  onChartSelect,
  onAddChart,
  onDeleteChart,
}: ChartSelectorProps) => {

  // FIX: Simplified handler that calls the parent function with the chart ID
  // It also stops the event from bubbling up to the chart selection button.
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (charts.length > 1) {
      onDeleteChart(id);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          {/* FIX: Use charts prop directly */}
          <CardTitle>Gráficos [{charts.length}]</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 group"
            onClick={onAddChart}
          >
            <PlusCircle className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex flex-col p-2 space-y-1">
            {/* FIX: Use charts prop directly */}
            {charts.length > 0 ? (
              charts.map((chart) => (
                <div
                  key={chart.id}
                  className="relative flex items-center group/item space-x-2 mx-2"
                >
                  {/* Chart Button */}
                  <Button
                    variant="ghost"
                    className={`w-full flex items-center justify-start p-3 rounded-md h-auto transition-all duration-200 hover:bg-accent/50 ${
                      activeChartId === chart.id
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                    onClick={() => onChartSelect(chart.id)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{chart.chartType}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {chart.xAxis && chart.yAxis
                          ? `${chart.xAxis.replace("years", "Anos")
                              .replace("months", "Meses")
                              .replace("days", "Dias")
                              .replace("change", "Alteração")}
                           - KPI ${chart.yAxis}` +
                            (chart.zAxis ? ` vs. ${chart.zAxis}` : "")
                          : "Não configurado"}
                      </p>
                    </div>
                  </Button>

                  {/* Delete Icon */}
                  {/* FIX: Use charts prop directly */}
                  {charts.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`absolute right-2 group flex-shrink-0 rounded-md transition-all duration-200 opacity-0 group-hover/item:opacity-100 ${
                        activeChartId === chart.id
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-500 hover:text-red-600"
                      }`}
                      onClick={(e) => handleDelete(e, chart.id)}
                      title="Remover gráfico"
                    >
                      <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                    </Button>
                  )}
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