
const API_BASE_URL = "https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api";
const API_CODE = "z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==";

interface KPI {
  Id: number;
  Name: string;
  Description: string;
  Unit: string;
  Value_1: string;
  Value_2: string | null;
}

export interface KPIOption {
  id: string;
  name: string;
  displayName: string;
  value: string;
}

export interface KPIValueHistory {
  Id: number;
  KpiId: number;
  NewValue_1: string;
  NewValue_2: string | null;
  OldValue_1: string | null;
  OldValue_2: string | null;
  ChangedAt: string;
  ChangedBy: string;
}

export const fetchUserKPIs = async (): Promise<KPIOption[]> => {
  try {
    // Get auth token from localStorage
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      throw new Error("No auth token found");
    }

    const parsedToken = JSON.parse(tokenData);
    const token = parsedToken.token;

    const response = await fetch(
      `${API_BASE_URL}/roles/1/kpis?code=${API_CODE}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching KPIs: ${response.statusText}`);
    }

    const kpis: KPI[] = await response.json();
    
    // Process KPIs into options
    const options: KPIOption[] = [];
    
    kpis.forEach(kpi => {
      // Add Value_1 option
      options.push({
        id: `${kpi.Id}-1`,
        name: kpi.Name,
        displayName: `${kpi.Name} (1)`,
        value: kpi.Value_1
      });
      
      // Add Value_2 option if it exists
      if (kpi.Value_2 !== null) {
        options.push({
          id: `${kpi.Id}-2`,
          name: kpi.Name,
          displayName: `${kpi.Name} (2)`,
          value: kpi.Value_2
        });
      }
    });

    return options;
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    throw error;
  }
};

export const fetchKPIValueHistory = async (kpiId: string): Promise<KPIValueHistory[]> => {
  try {
    // Get auth token from localStorage
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      throw new Error("No auth token found");
    }

    const parsedToken = JSON.parse(tokenData);
    const token = parsedToken.token;

    // Extract the numeric KPI ID from the formatted id (e.g., "3-1" -> "3")
    const numericKpiId = kpiId.split('-')[0];

    const response = await fetch(
      `${API_BASE_URL}/kpis/valuehistory?kpiId=${numericKpiId}&code=${API_CODE}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching KPI value history: ${response.statusText}`);
    }

    const history: KPIValueHistory[] = await response.json();
    
    // Sort by ChangedAt timestamp (newest first)
    return history.sort((a, b) => new Date(b.ChangedAt).getTime() - new Date(a.ChangedAt).getTime());
  } catch (error) {
    console.error("Error fetching KPI value history:", error);
    throw error;
  }
};
