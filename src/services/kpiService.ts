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
  ChangedByUserId: number;
  NewValue_1: string;
  NewValue_2: string | null;
  OldValue_1: string | null;
  OldValue_2: string | null;
  ChangedAt: string;
  Unit: string;
  ByProduct: boolean;
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
    
    // Process KPIs into unique options (no more -1/-2 suffix)
    const options: KPIOption[] = [];
    const uniqueKpiIds = new Set<number>();
    
    kpis.forEach(kpi => {
      // Only add each KPI once, regardless of having Value_1 and Value_2
      if (!uniqueKpiIds.has(kpi.Id)) {
        uniqueKpiIds.add(kpi.Id);
        options.push({
          id: kpi.Id.toString(),
          name: kpi.Name,
          displayName: kpi.Name,
          value: kpi.Value_1
        });
      }
    });

    return options;
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    throw error;
  }
};

export const fetchKPIById = async (kpiId: string): Promise<KPIDetails> => {
  try {
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      throw new Error("No auth token found");
    }

    const parsedToken = JSON.parse(tokenData);
    const token = parsedToken.token;

    const response = await fetch(
      `${API_BASE_URL}/kpis/byid/${kpiId}?code=${API_CODE}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching KPI details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching KPI details:", error);
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

    const response = await fetch(
      `${API_BASE_URL}/kpis/valuehistory?kpiId=${kpiId}&code=${API_CODE}`,
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
    
    // If no history, fetch current value
    if (history.length === 0) {
      const kpiDetails = await fetchKPIById(kpiId);
      
      // Create a fake history entry with current values
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
    
    // Sort by ChangedAt timestamp (newest first)
    return history.sort((a, b) => new Date(b.ChangedAt).getTime() - new Date(a.ChangedAt).getTime());
  } catch (error) {
    console.error("Error fetching KPI value history:", error);
    throw error;
  }
};

export const fetchMultipleKPIHistories = async (kpiIds: string[]): Promise<{ [kpiId: string]: KPIValueHistory[] }> => {
  try {
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      throw new Error("No auth token found");
    }

    const parsedToken = JSON.parse(tokenData);
    const token = parsedToken.token;

    const histories: { [kpiId: string]: KPIValueHistory[] } = {};
    
    // Get unique numeric KPI IDs
    const uniqueKpiIds = [...new Set(kpiIds.map(id => id.split('-')[0]))];
    
    // Fetch histories for all unique KPIs
    await Promise.all(
      uniqueKpiIds.map(async (numericKpiId) => {
        try {
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

          if (response.ok) {
            const history: KPIValueHistory[] = await response.json();
            histories[numericKpiId] = history.sort((a, b) => new Date(b.ChangedAt).getTime() - new Date(a.ChangedAt).getTime());
          }
        } catch (error) {
          console.error(`Error fetching history for KPI ${numericKpiId}:`, error);
          histories[numericKpiId] = [];
        }
      })
    );

    return histories;
  } catch (error) {
    console.error("Error fetching multiple KPI histories:", error);
    throw error;
  }
};
