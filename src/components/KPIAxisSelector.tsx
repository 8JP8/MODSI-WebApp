
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserKPIs, fetchKPIById, KPIOption } from "@/services/kpiService";
import { toast } from "sonner";

interface KPIAxisSelectorProps {
  selectedZAxis: string;
  selectedSecondaryAxis: string;
  selectedYAxis: string;
  onSelectZAxis: (value: string) => void;
  onSelectSecondaryAxis: (value: string) => void;
  onSelectYAxis: (value: string) => void;
}

const KPIAxisSelector = ({
  selectedZAxis,
  selectedSecondaryAxis,
  selectedYAxis,
  onSelectZAxis,
  onSelectSecondaryAxis,
  onSelectYAxis
}: KPIAxisSelectorProps) => {
  const [kpiOptions, setKpiOptions] = useState<KPIOption[]>([]);
  const [kpiUnits, setKpiUnits] = useState<{[key: string]: string}>({});
  const [kpiByProduct, setKpiByProduct] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);

  const timeOptions = [
    { value: "days", label: "Dias" },
    { value: "months", label: "Meses" },
    { value: "years", label: "Anos" },
    { value: "change", label: "Alteração" }
  ];

  useEffect(() => {
    const loadKPIs = async () => {
      try {
        setLoading(true);
        const options = await fetchUserKPIs();
        setKpiOptions(options);
        
        // Load units and ByProduct for all KPIs
        const units: {[key: string]: string} = {};
        const byProducts: {[key: string]: boolean} = {};
        for (const option of options) {
          try {
            const kpiDetails = await fetchKPIById(option.id);
            units[option.id] = kpiDetails.Unit;
            byProducts[option.id] = kpiDetails.ByProduct;
          } catch (error) {
            console.error(`Error loading details for KPI ${option.id}:`, error);
            units[option.id] = "";
            byProducts[option.id] = false;
          }
        }
        setKpiUnits(units);
        setKpiByProduct(byProducts);
      } catch (error) {
        toast.error("Erro ao carregar KPIs");
        console.error("Error loading KPIs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração dos Eixos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">A carregar KPIs...</div>
        </CardContent>
      </Card>
    );
  }

  const formatKPIOptionLabel = (option: KPIOption, isSelected: boolean = false) => {
    const unit = kpiUnits[option.id];
    if (isSelected && unit) {
      return `${option.name} (${unit})`;
    }
    return unit ? `${option.name} (${unit})` : option.name;
  };

  const getSelectedKPILabel = (kpiId: string) => {
    const option = kpiOptions.find(opt => opt.id === kpiId);
    if (!option) return "Selecione o indicador";
    return formatKPIOptionLabel(option, true);
  };

  // Filter Z-axis options based on main KPI's ByProduct
  const getFilteredZAxisOptions = () => {
    if (!selectedZAxis) return kpiOptions;
    const mainKpiByProduct = kpiByProduct[selectedZAxis];
    return kpiOptions.filter(option => 
      option.id !== selectedZAxis && kpiByProduct[option.id] === mainKpiByProduct
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração dos Eixos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Y Axis - Main Indicator */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Eixo Y - Indicador Principal</label>
          <Select value={selectedZAxis} onValueChange={onSelectZAxis}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o indicador principal">
                {selectedZAxis ? getSelectedKPILabel(selectedZAxis) : "Selecione o indicador principal"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {kpiOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {formatKPIOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* X Axis - Time or Product */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Eixo X - Por Tempo ou por Alteração</label>
          <Select value={selectedSecondaryAxis} onValueChange={onSelectSecondaryAxis}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma divisão de tempo ou alteração" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Z Axis - Optional Related Indicator */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Eixo Z - Indicador para Comparação (Opcional)
          </label>
          <Select 
            value={selectedYAxis} 
            onValueChange={onSelectYAxis}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione indicador para comparação">
                {selectedYAxis && selectedYAxis !== "none" ? getSelectedKPILabel(selectedYAxis) : "Nenhum"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {getFilteredZAxisOptions().map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {formatKPIOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPIAxisSelector;
