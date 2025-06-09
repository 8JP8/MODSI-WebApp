import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // Confirme que o caminho está correto
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
  const { logout } = useAuth();
  const navigate = useNavigate();

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
    // Definimos a função async dentro do useEffect para poder usar async/await
    const loadKPIs = async () => {
      try {
        setLoading(true);
        // A função fetchUserKPIs agora lança um erro que podemos inspecionar
        const options = await fetchUserKPIs();
        setKpiOptions(options);
        
        const units: {[key: string]: string} = {};
        const byProducts: {[key: string]: boolean} = {};
        
        // Usamos Promise.all para buscar os detalhes de todos os KPIs em paralelo
        await Promise.all(options.map(async (option) => {
          try {
            const kpiDetails = await fetchKPIById(option.id);
            units[option.id] = kpiDetails.Unit;
            byProducts[option.id] = kpiDetails.ByProduct;
          } catch (error: any) {
            // Se um dos fetches individuais falhar, pode ser um erro 401 também
            if (error.response?.status === 401 || error.response?.status === 403) {
              throw error; // Lança o erro para ser apanhado pelo catch principal
            }
            console.error(`Error loading details for KPI ${option.id}:`, error);
            // Define valores padrão em caso de erro para este KPI específico
            units[option.id] = "";
            byProducts[option.id] = false;
          }
        }));

        setKpiUnits(units);
        setKpiByProduct(byProducts);

      } catch (error: any) {
        console.error("Critical error loading KPIs:", error);

        // Verifica se o erro tem a `response` e se o status é 401 ou 403
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("A sua sessão expirou. Por favor, faça login novamente.");
          
          // Aguarda um pouco para o utilizador ler o toast e depois faz logout
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2500);

        } else {
          // Para outros tipos de erro, apenas mostra a mensagem
          toast.error("Erro ao carregar os seus KPIs. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, [logout, navigate]); // Adicionar logout e navigate às dependências do useEffect

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