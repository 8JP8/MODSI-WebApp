
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Chart } from "@/types/vr-dashboard";

interface ChartSelectorProps {
  charts: Chart[];
  activeChartId: string;
  onChartSelect: (id: string) => void;
  onAddChart: () => void;
}

const ChartSelector = ({ charts, activeChartId, onChartSelect, onAddChart }: ChartSelectorProps) => {
  return (
    <Card>
      <CardTitle> Gráficos ({charts.length})</CardTitle>
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 group"
            onClick={onAddChart}
          >
            <PlusCircle className="mr-1 h-4 w-4 transition-transform duration-200 hover:rotate-90" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex flex-col p-2 space-y-1">
            {charts.length > 0 ? (
              charts.map((chart) => (
                <Button
                  key={chart.id}
                  variant="ghost"
                  className={`
                    flex items-center justify-start p-3 rounded-md h-auto mx-2 transition-all duration-200 hover:scale-105
                    ${activeChartId === chart.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}
                  `}
                  onClick={() => onChartSelect(chart.id)}
                >
                  <div className="text-left">
                    <p className="font-medium">{chart.chartType}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {chart.xAxis && chart.yAxis ? `${chart.xAxis} vs ${chart.yAxis}` : "Não configurado"}
                    </p>
                  </div>
                </Button>
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
