
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserKPIs, KPIOption } from "@/services/kpiService";
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

  // Check if product is selected for X axis
  const isProductSelected = selectedSecondaryAxis === "product";

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
              <SelectValue placeholder="Selecione o indicador principal" />
            </SelectTrigger>
            <SelectContent>
              {kpiOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
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
            Eixo Z - Indicador Relacionado (Opcional)
          </label>
          <Select 
            value={isProductSelected ? "none" : selectedYAxis} 
            onValueChange={onSelectYAxis}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione indicador relacionado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {!isProductSelected && kpiOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
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
