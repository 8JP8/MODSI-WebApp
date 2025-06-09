import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Importar os serviços e tipos necessários
import { fetchUserKPIs, fetchKPIById, KPIOption, KPIDetails, AuthError } from "@/services/kpiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface KPIAxisSelectorProps {
  selectedYAxis: string;
  selectedSecondaryAxis: string;
  selectedZAxis: string;
  onSelectYAxis: (value: string) => void;
  onSelectSecondaryAxis: (value: string) => void;
  onSelectZAxis: (value: string) => void;
}

const KPIAxisSelector = ({
  selectedYAxis,
  selectedSecondaryAxis,
  selectedZAxis,
  onSelectYAxis,
  onSelectSecondaryAxis,
  onSelectZAxis
}: KPIAxisSelectorProps) => {
  const [kpiOptions, setKpiOptions] = useState<KPIOption[]>([]);
  const [kpiUnits, setKpiUnits] = useState<{[key: string]: string}>({});
  const [kpiByProduct, setKpiByProduct] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  
  // Obter a função de logout do contexto de autenticação
  const { logout } = useAuth();

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
        
        const units: {[key: string]: string} = {};
        const byProducts: {[key: string]: boolean} = {};

        // Usar Promise.all para carregar detalhes em paralelo é mais eficiente
        await Promise.all(options.map(async (option) => {
            const kpiDetails = await fetchKPIById(option.id);
            units[option.id] = kpiDetails.Unit;
            byProducts[option.id] = kpiDetails.ByProduct;
        }));

        setKpiUnits(units);
        setKpiByProduct(byProducts);
      } catch (error) {
        // PONTO-CHAVE: Tratamento de erros
        if (error instanceof AuthError) {
          // Se for um erro de autenticação, o serviço detetou um 401.
          // A função logout já lida com a notificação e o redirecionamento.
          logout();
        } else {
          // Se for outro tipo de erro (rede, 500, etc.)
          toast.error("Erro ao carregar os dados dos KPIs.");
          console.error("Error loading KPIs:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, [logout]); // Adicionar logout como dependência

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Configuração dos Eixos</CardTitle></CardHeader>
        <CardContent><div className="text-center py-4">A carregar KPIs...</div></CardContent>
      </Card>
    );
  }

  const formatKPIOptionLabel = (option: KPIOption, isSelected: boolean = false) => {
    const unit = kpiUnits[option.id];
    if (isSelected && unit) return `${option.name} (${unit})`;
    return unit ? `${option.name} (${unit})` : option.name;
  };

  const getSelectedKPILabel = (kpiId: string) => {
    const option = kpiOptions.find(opt => opt.id === kpiId);
    if (!option) return "Selecione o indicador";
    return formatKPIOptionLabel(option, true);
  };

  const getFilteredZAxisOptions = () => {
    if (!selectedYAxis) return kpiOptions;
    const mainKpiByProduct = kpiByProduct[selectedYAxis];
    return kpiOptions.filter(option => 
      option.id !== selectedYAxis && kpiByProduct[option.id] === mainKpiByProduct
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle>Configuração dos Eixos</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Eixo Y - Indicador Principal</label>
          <Select value={selectedYAxis} onValueChange={onSelectYAxis}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o indicador principal">
                {selectedYAxis ? getSelectedKPILabel(selectedYAxis) : "Selecione o indicador principal"}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Eixo X - Por Tempo ou por Alteração</label>
          <Select value={selectedSecondaryAxis} onValueChange={onSelectSecondaryAxis}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma divisão de tempo ou alteração" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Eixo Z - Indicador para Comparação (Opcional)</label>
          <Select value={selectedZAxis || "none"} onValueChange={onSelectZAxis} disabled={!selectedYAxis}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={!selectedYAxis ? "Selecione primeiro o indicador principal" : "Selecione indicador para comparação"}>
                {selectedZAxis && selectedZAxis !== "none" ? getSelectedKPILabel(selectedZAxis) : "Nenhum"}
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