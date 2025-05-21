
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartTypeSelector from "./ChartTypeSelector";

interface DataIndicatorSelectorProps {
  availableIndicators: string[];
  onSelectXAxis: (indicator: string) => void;
  onSelectYAxis: (indicator: string) => void;
  onSelectZAxis?: (indicator: string) => void;
  selectedX: string;
  selectedY: string;
  selectedZ?: string;
  chartType: string;
  onSelectChartType: (type: string) => void;
  departments?: string[];
  selectedDepartment?: string;
  onDepartmentChange?: (department: string) => void;
  allowDeselectDepartment?: boolean;
}

const DataIndicatorSelector = ({
  availableIndicators,
  onSelectXAxis,
  onSelectYAxis,
  onSelectZAxis,
  selectedX,
  selectedY,
  selectedZ,
  chartType,
  onSelectChartType,
  departments = [],
  selectedDepartment = "",
  onDepartmentChange,
  allowDeselectDepartment = false,
}: DataIndicatorSelectorProps) => {
  const isPieChart = chartType === "pie";

  const handleZAxisChange = (value: string) => {
    if (onSelectZAxis) {
      onSelectZAxis(value === "none" ? "" : value);
    }
  };

  const handleDepartmentChange = (value: string) => {
    if (onDepartmentChange) {
      onDepartmentChange(value === "none" ? "" : value);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Gráfico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type Section */}
        <ChartTypeSelector 
          selectedType={chartType} 
          onSelect={onSelectChartType} 
        />
        
        <div className="border-t border-slate-700 pt-5">
          <h3 className="text-lg font-semibold mb-4">Indicadores de Dados</h3>
          
          {departments.length > 0 && onDepartmentChange && (
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Departamento Selecionado</label>
              <Select value={selectedDepartment || "none"} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {allowDeselectDepartment && (
                    <SelectItem value="none">Nenhum (Todos os Departamentos)</SelectItem>
                  )}
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {isPieChart ? (
            <>
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Categorias</label>
                <Select value={selectedX} onValueChange={onSelectXAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valores</label>
                <Select value={selectedY} onValueChange={onSelectYAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione os valores" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Eixo X</label>
                <Select value={selectedX} onValueChange={onSelectXAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o eixo X" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Eixo Y</label>
                <Select value={selectedY} onValueChange={onSelectYAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o eixo Y" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {onSelectZAxis && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Eixo Z (Opcional)</label>
                  <Select value={selectedZ || "none"} onValueChange={handleZAxisChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o eixo Z" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {availableIndicators.map((indicator) => (
                        <SelectItem key={indicator} value={indicator}>
                          {indicator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataIndicatorSelector;
