import { useState, useEffect } from "react";
import { fetchKPIValueHistory, fetchUserKPIs, fetchKPIById, KPIValueHistory } from "@/services/kpiService";
import { toast } from "sonner";

export interface ProcessedChartData {
  name: string;
  [key: string]: any;
}

export const useChartDataProcessor = (yAxis: string, xAxis: string, zAxis: string) => {
  const [chartData, setChartData] = useState<ProcessedChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [kpiUnits, setKpiUnits] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!yAxis || !xAxis) {
      console.log("ChartDataProcessor: Missing yAxis or xAxis", { yAxis, xAxis });
      setChartData([]);
      return;
    }

    loadChartData();
  }, [yAxis, xAxis, zAxis]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      console.log("ChartDataProcessor: Loading chart data for:", { yAxis, xAxis, zAxis });
      
      await loadTimeBasedData();
    } catch (error) {
      toast.error("Erro ao carregar dados do gráfico");
      console.error("ChartDataProcessor: Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const ensureKPIData = async (kpiId: string): Promise<KPIValueHistory[]> => {
    let history = await fetchKPIValueHistory(kpiId);
    
    // If no history, fetch current value and create fake history entry
    if (history.length === 0) {
      console.log(`ChartDataProcessor: No history found for KPI ${kpiId}, fetching current value`);
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
      
      history = [currentValueHistory];
    }
    
    return history;
  };

  const loadTimeBasedData = async () => {
    // Always load Y-axis data first
    const yKpiId = yAxis;
    console.log("ChartDataProcessor: Fetching history for Y-axis KPI:", yKpiId);
    
    const yHistory = await ensureKPIData(yKpiId);
    console.log("ChartDataProcessor: Raw Y-axis history data:", yHistory);
    
    // Get KPI units information
    const units: {[key: string]: string} = {};
    if (yHistory.length > 0 && yHistory[0].Unit) {
      units[yAxis] = yHistory[0].Unit;
    }
    
    // Process Y-axis data independently
    const yAxisData = formatGraphData(yHistory, xAxis, yAxis);
    console.log("ChartDataProcessor: Formatted Y-axis data:", yAxisData);
    
    // Initialize final data with Y-axis data
    let finalData = [...yAxisData];
    
    // If Z-axis is selected, load and process its data independently
    if (zAxis && zAxis !== "none") {
      const zKpiId = zAxis;
      console.log("ChartDataProcessor: Fetching Z-axis history for KPI:", zKpiId);
      
      const zHistory = await ensureKPIData(zKpiId);
      console.log("ChartDataProcessor: Raw Z-axis history data:", zHistory);
      
      if (zHistory.length > 0 && zHistory[0].Unit) {
        units[zAxis] = zHistory[0].Unit;
      }
      
      const zAxisData = formatGraphData(zHistory, xAxis, zAxis);
      console.log("ChartDataProcessor: Formatted Z-axis data:", zAxisData);
      
      // Combine both datasets properly
      finalData = combineIndependentSeries(yAxisData, zAxisData, yAxis, zAxis, xAxis);
    }
    
    setKpiUnits(units);
    
    console.log("ChartDataProcessor: Final processed data:", finalData);
    setChartData(finalData);
  };

  const formatGraphData = (rawData: KPIValueHistory[], groupBy: string, kpiId: string): ProcessedChartData[] => {
    console.log("ChartDataProcessor: formatGraphData input:", { rawData, groupBy, kpiId });
    
    // Helper: validate and format date keys according to groupBy
    function formatDateKey(dateStr: string) {
      if (!dateStr) {
        console.warn("ChartDataProcessor: Empty date string");
        return null;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        console.warn(`ChartDataProcessor: Invalid date for formatDateKey: ${dateStr}`);
        return null;
      }
      if (groupBy === "days") return d.toISOString().slice(0, 10); // yyyy-mm-dd
      if (groupBy === "months") return d.toISOString().slice(0, 7); // yyyy-mm
      if (groupBy === "years") return d.getFullYear().toString(); // yyyy
      if (groupBy === "change") return dateStr; // Use full timestamp for changes
      return d.toISOString().slice(0, 10); // default to day format
    }

    // Check if this KPI is ByProduct
    const isByProduct = rawData.length > 0 && rawData[0].ByProduct;

    // For "change" groupBy, keep all individual changes
    if (groupBy === "change") {
      const result = rawData.map((item, index) => {
        const val1 = parseFloat(item.NewValue_1);
        const val2 = parseFloat(item.NewValue_2);
        
        const date = new Date(item.ChangedAt);
        const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        const resultItem: ProcessedChartData = {
          name: timeLabel,
          originalKey: item.ChangedAt
        };

        if (isByProduct) {
          resultItem[`KPI ${kpiId} (Produto 1)`] = isNaN(val1) ? 0 : val1;
          resultItem[`KPI ${kpiId} (Produto 2)`] = isNaN(val2) ? 0 : val2;
        } else {
          resultItem[`KPI ${kpiId}`] = isNaN(val1) ? 0 : val1;
        }

        return resultItem;
      }).reverse(); // Show oldest first
      
      console.log("ChartDataProcessor: Change-based result:", result);
      return result;
    }

    // For time-based grouping, aggregate by time period
    const grouped: { [key: string]: { time: string; NewValue_1: number; NewValue_2: number; ChangedAt: string | null; count: number } } = {};
    
    rawData.forEach(item => {
      if (!item.ChangedAt) {
        console.warn("ChartDataProcessor: Skipping item with missing ChangedAt:", item);
        return;
      }
      const key = formatDateKey(item.ChangedAt);
      if (!key) {
        console.warn("ChartDataProcessor: Skipping item with invalid date after formatDateKey:", item.ChangedAt);
        return;
      }
      
      if (!grouped[key]) {
        grouped[key] = { time: key, NewValue_1: 0, NewValue_2: 0, ChangedAt: null, count: 0 };
      }
      
      // Use the most recent values for each time period
      const currentDate = new Date(item.ChangedAt);
      const storedDate = grouped[key].ChangedAt ? new Date(grouped[key].ChangedAt) : null;

      if (!storedDate || currentDate >= storedDate) {
        let val1 = parseFloat(item.NewValue_1);
        let val2 = parseFloat(item.NewValue_2);
        grouped[key].NewValue_1 = isNaN(val1) ? 0 : val1;
        grouped[key].NewValue_2 = isNaN(val2) ? 0 : val2;
        grouped[key].ChangedAt = item.ChangedAt;
      }
      grouped[key].count++;
    });

    if (Object.keys(grouped).length === 0) {
      console.warn("ChartDataProcessor: No valid data after filtering.");
      return [];
    }

    const sortedKeys = Object.keys(grouped).sort();
    console.log("ChartDataProcessor: Sorted keys:", sortedKeys);
    
    // Format x axis labels nicely
    function formatLabel(key: string) {
      if (groupBy === "days") return key; // yyyy-mm-dd
      if (groupBy === "months") {
        const [year, month] = key.split("-");
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return monthNames[parseInt(month) - 1] + " " + year;
      }
      if (groupBy === "years") return key;
      return key;
    }

    const result = sortedKeys.map(key => {
      const resultItem: ProcessedChartData = {
        name: formatLabel(key),
        originalKey: key
      };

      if (isByProduct) {
        resultItem[`KPI ${kpiId} (Produto 1)`] = grouped[key].NewValue_1;
        resultItem[`KPI ${kpiId} (Produto 2)`] = grouped[key].NewValue_2;
      } else {
        resultItem[`KPI ${kpiId}`] = grouped[key].NewValue_1;
      }

      return resultItem;
    });
    
    console.log("ChartDataProcessor: formatGraphData result:", result);
    return result;
  };

  const combineIndependentSeries = (
    yAxisData: ProcessedChartData[], 
    zAxisData: ProcessedChartData[], 
    yAxisName: string, 
    zAxisName: string,
    xAxis: string
  ): ProcessedChartData[] => {
    console.log("ChartDataProcessor: combineIndependentSeries input:", { yAxisData, zAxisData, yAxisName, zAxisName });
    
    // For "change" groupBy, we need to merge all timestamps from both KPIs
    if (xAxis === "change") {
      const timeMap = new Map<string, ProcessedChartData>();
      
      // Add Y-axis data
      yAxisData.forEach(item => {
        timeMap.set(item.originalKey || item.name, { ...item });
      });
      
      // Add Z-axis data, merging with existing entries or creating new ones
      zAxisData.forEach(item => {
        const key = item.originalKey || item.name;
        if (timeMap.has(key)) {
          const existing = timeMap.get(key)!;
          Object.keys(item).forEach(dataKey => {
            if (dataKey !== 'name' && dataKey !== 'originalKey') {
              existing[dataKey] = item[dataKey];
            }
          });
        } else {
          timeMap.set(key, { ...item });
        }
      });
      
      // Sort by timestamp and return
      return Array.from(timeMap.values()).sort((a, b) => {
        const dateA = new Date(a.originalKey || a.name);
        const dateB = new Date(b.originalKey || b.name);
        return dateA.getTime() - dateB.getTime();
      });
    }

    // For other groupings, merge both series ensuring all time periods are represented
    const allTimeKeys = new Set([
      ...yAxisData.map(item => item.originalKey || item.name),
      ...zAxisData.map(item => item.originalKey || item.name)
    ]);

    const yMap = new Map();
    yAxisData.forEach(item => {
      yMap.set(item.originalKey || item.name, item);
    });

    const zMap = new Map();
    zAxisData.forEach(item => {
      zMap.set(item.originalKey || item.name, item);
    });

    const result = Array.from(allTimeKeys).sort().map(timeKey => {
      const yItem = yMap.get(timeKey);
      const zItem = zMap.get(timeKey);
      
      const resultItem: ProcessedChartData = {
        name: yItem?.name || zItem?.name || timeKey
      };

      // Copy Y-axis data if available
      if (yItem) {
        Object.keys(yItem).forEach(key => {
          if (key !== 'name' && key !== 'originalKey') {
            resultItem[key] = yItem[key];
          }
        });
      }

      // Add Z-axis data if available
      if (zItem) {
        Object.keys(zItem).forEach(key => {
          if (key !== 'name' && key !== 'originalKey') {
            resultItem[key] = zItem[key];
          }
        });
      }

      return resultItem;
    });
    
    console.log("ChartDataProcessor: Combined independent result:", result);
    return result;
  };

  return {
    chartData,
    loading,
    kpiUnits
  };
};
