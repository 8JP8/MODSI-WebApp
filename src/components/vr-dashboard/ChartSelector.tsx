
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Chart } from "@/types/vr-dashboard";
import { Department } from "@/utils/apiService";

interface ChartSelectorProps {
  charts: Chart[];
  activeChartId: string;
  onChartSelect: (id: string) => void;
  onAddChart: () => void;
  departments?: Department[];
}

const ChartSelector = ({ 
  charts, 
  activeChartId, 
  onChartSelect, 
  onAddChart,
  departments = []
}: ChartSelectorProps) => {
  
  // Helper to get department name by ID
  const getDepartmentName = (id: number): string => {
    const department = departments.find(dept => dept.Id === id);
    return department ? department.Name : `Department ${id}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Gráficos ({charts.length})</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={onAddChart}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex flex-col p-2">
            {charts.length > 0 ? (
              charts.map((chart) => (
                <div
                  key={chart.id}
                  className={`
                    flex items-center p-3 rounded-md mb-1 cursor-pointer transition-colors
                    ${activeChartId === chart.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}
                  `}
                  onClick={() => onChartSelect(chart.id)}
                >
                  <div>
                    <p className="font-medium">{chart.chartType}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {chart.xAxis && chart.yAxis ? `${chart.xAxis} vs ${chart.yAxis}` : "Não configurado"}
                    </p>
                    {chart.departmentId > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Departamento: {getDepartmentName(chart.departmentId)}
                      </p>
                    )}
                  </div>
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
