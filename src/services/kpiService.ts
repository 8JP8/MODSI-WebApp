
const API_BASE_URL = "https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api";

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
      `${API_BASE_URL}/roles/1/kpis`,
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
