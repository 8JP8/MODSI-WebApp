import { AuthTokenData } from "@/hooks/useAuth"; // Importa o tipo do seu hook de autenticação

// --- Constantes da API ---
const API_BASE_URL = "https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api";
const API_CODE = "z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==";

// --- Erro Personalizado para Autenticação ---
// Lançado quando a API retorna 401 ou o token não é encontrado.
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// --- Função Central de Fetch Autenticado ---
// Todas as chamadas à API que precisam de token devem usar esta função.
const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const tokenDataString = localStorage.getItem("authToken");
  if (!tokenDataString) {
    // Se não há token, é um erro de autenticação.
    throw new AuthError("Nenhum token de autenticação encontrado no localStorage.");
  }

  const tokenData: AuthTokenData = JSON.parse(tokenDataString);

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${tokenData.token}`);
  if (!options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Constrói a URL completa, adicionando o código da API.
  const url = `${API_BASE_URL}${endpoint}&code=${API_CODE}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // PONTO-CHAVE: Se a resposta for 401, o token é inválido. Lançamos nosso erro personalizado.
  if (response.status === 401) {
    throw new AuthError("Acesso não autorizado. A sessão pode ter expirado.");
  }

  if (!response.ok) {
    // Para outros erros (500, 404, etc.), lançamos um erro genérico com mais detalhes.
    const errorBody = await response.text();
    throw new Error(`Falha na requisição à API (${response.status}): ${errorBody}`);
  }

  // Se tudo correu bem, retorna a resposta em JSON.
  return response.json();
};


// --- Interfaces da API (baseadas no seu ficheiro original) ---

interface KPI {
  Id: number;
  Name: string;
  // Adicione outras propriedades se a API as retornar neste endpoint
}

// Interface ajustada para corresponder ao uso no KPIAxisSelector
export interface KPIOption {
  id: string;
  name: string;
}

export interface KPIDetails {
  Id: number;
  Name: string;
  Description: string;
  Unit: string;
  Value_1: string;
  Value_2: string | null;
  ByProduct: boolean;
  AvailableInDepartments: string[];
}

export interface KPIValueHistory {
  Id: number;
  KpiId: number;
  ChangedByUserId: number;
  NewValue_1: string;
  NewValue_2: string | null;
  OldValue_1: string | null;
  OldValue_2: string | null;
  ChangedAt: string;
  Unit: string;
  ByProduct: boolean;
}

// --- Funções da API Refatoradas ---

export const fetchUserKPIs = async (): Promise<KPIOption[]> => {
  try {
    // O endpoint é /roles/1/kpis. O '?' é adicionado automaticamente pelo authenticatedFetch
    const kpis: KPI[] = await authenticatedFetch(`/roles/1/kpis?`, { method: 'GET' });
    
    const options: KPIOption[] = [];
    const uniqueKpiIds = new Set<number>();
    
    kpis.forEach(kpi => {
      if (!uniqueKpiIds.has(kpi.Id)) {
        uniqueKpiIds.add(kpi.Id);
        options.push({
          id: kpi.Id.toString(),
          name: kpi.Name,
        });
      }
    });

    return options;
  } catch (error) {
    console.error("Erro em fetchUserKPIs:", error);
    throw error; // Propaga o erro (seja AuthError ou outro)
  }
};

export const fetchKPIById = async (kpiId: string): Promise<KPIDetails> => {
  try {
    return await authenticatedFetch(`/kpis/byid/${kpiId}?`, { method: 'GET' });
  } catch (error) {
    console.error(`Erro em fetchKPIById para o ID ${kpiId}:`, error);
    throw error;
  }
};

export const fetchKPIValueHistory = async (kpiId: string): Promise<KPIValueHistory[]> => {
  try {
    const history: KPIValueHistory[] = await authenticatedFetch(`/kpis/valuehistory?kpiId=${kpiId}`, { method: 'GET' });
    
    if (history.length === 0) {
      // Se não há histórico, busca o valor atual para criar uma entrada "falsa"
      const kpiDetails = await fetchKPIById(kpiId);
      
      const currentValueHistory: KPIValueHistory = {
        Id: 0,
        KpiId: kpiDetails.Id,
        ChangedByUserId: 0,
        NewValue_1: kpiDetails.Value_1,
        NewValue_2: kpiDetails.Value_2,
        OldValue_1: null,
        OldValue_2: null,
        ChangedAt: new Date().toISOString(),
        Unit: kpiDetails.Unit,
        ByProduct: kpiDetails.ByProduct
      };
      
      return [currentValueHistory];
    }
    
    return history.sort((a, b) => new Date(b.ChangedAt).getTime() - new Date(a.ChangedAt).getTime());
  } catch (error) {
    console.error(`Erro em fetchKPIValueHistory para o ID ${kpiId}:`, error);
    throw error;
  }
};

export const fetchMultipleKPIHistories = async (kpiIds: string[]): Promise<{ [kpiId: string]: KPIValueHistory[] }> => {
  const histories: { [kpiId: string]: KPIValueHistory[] } = {};
  
  // Garante que não há IDs duplicados
  const uniqueKpiIds = [...new Set(kpiIds.map(id => id.split('-')[0]))];
  
  try {
    await Promise.all(
      uniqueKpiIds.map(async (numericKpiId) => {
        // Usa a função já existente para buscar o histórico de cada KPI
        const history = await fetchKPIValueHistory(numericKpiId);
        histories[numericKpiId] = history;
      })
    );
    return histories;
  } catch (error) {
      // Se alguma das chamadas falhar (e.g., com AuthError), o Promise.all irá rejeitar.
      console.error("Erro em fetchMultipleKPIHistories:", error);
      throw error; // Propaga o erro para ser tratado no componente que chamou a função.
  }
};