
// API service for fetching departments and KPIs
const API_CODE = "z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==";
const BASE_API_URL = "http://localhost:7288/api";

export interface Department {
  Id: number;
  Name: string;
  RolesWithReadAccess: string[];
  RolesWithWriteAccess: string[];
}

export interface KPI {
  Id: number;
  Name: string;
  Description: string;
  Unit: string | null;
  Value_1: string | null;
  Value_2: string | null;
  IsBidimentional: boolean;
  AvailableInDepartments: string[];
}

export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${BASE_API_URL}/departments?code=${API_CODE}`);
    if (!response.ok) {
      throw new Error(`Error fetching departments: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return [];
  }
};

export const fetchDepartmentKPIs = async (departmentId: number): Promise<KPI[]> => {
  try {
    const response = await fetch(`${BASE_API_URL}/departments/${departmentId}/kpis?code=${API_CODE}`);
    if (!response.ok) {
      throw new Error(`Error fetching KPIs: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch KPIs for department ${departmentId}:`, error);
    return [];
  }
};

// Transform KPI to indicator format for chart selection
export const kpiToIndicator = (kpi: KPI): string[] => {
  const indicators: string[] = [];
  
  if (kpi.IsBidimentional) {
    // For bidimensional KPIs, create two entries with (1) and (2) suffixes
    indicators.push(`${kpi.Name} (1)`);
    indicators.push(`${kpi.Name} (2)`);
  } else {
    // For regular KPIs, just use the name
    indicators.push(kpi.Name);
  }
  
  return indicators;
};

// Find KPI by indicator name
export const findKpiByIndicator = (indicator: string, kpis: KPI[]): KPI | undefined => {
  const isBidimensional = indicator.includes(" (1)") || indicator.includes(" (2)");
  
  if (isBidimensional) {
    // Extract base name without (1) or (2)
    const baseName = indicator.replace(/ \(\d\)$/, "");
    return kpis.find(kpi => kpi.Name === baseName && kpi.IsBidimentional);
  } else {
    return kpis.find(kpi => kpi.Name === indicator);
  }
};
