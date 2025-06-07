
import { useState, useEffect } from "react";
import { fetchKPIValueHistory, fetchUserKPIs, fetchKPIById, KPIValueHistory } from "@/services/kpiService";
import { toast } from "sonner";

export interface ProcessedChartData {
  name: string;
  [key: string]: any;
}

export const useChartDataProcessor = (zAxis: string, xAxis: string, yAxis: string) => {
  const [chartData, setChartData] = useState<ProcessedChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [kpiUnits, setKpiUnits] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!zAxis || !xAxis) {
      console.log("ChartDataProcessor: Missing zAxis or xAxis", { zAxis, xAxis });
      setChartData([]);
      return;
    }

    loadChartData();
  }, [zAxis, xAxis, yAxis]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      console.log("ChartDataProcessor: Loading chart data for:", { zAxis, xAxis, yAxis });
      
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
    const zKpiId = zAxis;
    console.log("ChartDataProcessor: Fetching history for KPI:", zKpiId);
    
    // Ensure we have data for the main KPI
    const history = await ensureKPIData(zKpiId);
    console.log("ChartDataProcessor: Raw Z-axis history data:", history);
    
    // Get KPI units information
    const units: {[key: string]: string} = {};
    if (history.length > 0 && history[0].Unit) {
      units[zAxis] = history[0].Unit;
    }
    
    // Group data by time period based on xAxis selection
    const groupedData = formatGraphData(history, xAxis, zAxis);
    console.log("ChartDataProcessor: Grouped Z-axis data:", groupedData);
    
    // If yAxis is selected, also load its data
    let yAxisData: ProcessedChartData[] = [];
    let yHistory: KPIValueHistory[] = [];
    if (yAxis && yAxis !== "none") {
      const yKpiId = yAxis;
      console.log("ChartDataProcessor: Fetching Y-axis history for KPI:", yKpiId);
      
      // Ensure we have data for the Y-axis KPI
      yHistory = await ensureKPIData(yKpiId);
      console.log("ChartDataProcessor: Raw Y-axis history data:", yHistory);
      
      if (yHistory.length > 0 && yHistory[0].Unit) {
        units[yAxis] = yHistory[0].Unit;
      }
      
      yAxisData = formatGraphData(yHistory, xAxis, yAxis);
      console.log("ChartDataProcessor: Grouped Y-axis data:", yAxisData);
    }
    
    setKpiUnits(units);
    
    // Combine the data for multi-series display
    const processedData = combineSeriesData(groupedData, yAxisData, zAxis, yAxis, history, yHistory, xAxis);
    
    console.log("ChartDataProcessor: Final processed data:", processedData);
    setChartData(processedData);
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

  const combineSeriesData = (
    primaryData: ProcessedChartData[], 
    secondaryData: ProcessedChartData[], 
    zAxisName: string, 
    yAxisName: string,
    zHistory: KPIValueHistory[],
    yHistory: KPIValueHistory[],
    xAxis: string
  ): ProcessedChartData[] => {
    console.log("ChartDataProcessor: combineSeriesData input:", { primaryData, secondaryData, zAxisName, yAxisName });
    
    if (!secondaryData.length) {
      console.log("ChartDataProcessor: Primary only result:", primaryData);
      return primaryData;
    }

    // For "change" groupBy, we need to combine all timestamps from both KPIs
    if (xAxis === "change") {
      const allItems: Array<{item: KPIValueHistory, kpiId: string}> = [];
      
      // Add all Z-axis items
      zHistory.forEach(item => {
        allItems.push({item, kpiId: zAxisName});
      });
      
      // Add all Y-axis items
      yHistory.forEach(item => {
        allItems.push({item, kpiId: yAxisName});
      });
      
      // Sort by timestamp
      allItems.sort((a, b) => new Date(a.item.ChangedAt).getTime() - new Date(b.item.ChangedAt).getTime());
      
      // Group by timestamp to combine values that occur at the same time
      const timeMap = new Map<string, ProcessedChartData>();
      
      allItems.forEach(({item, kpiId}) => {
        const date = new Date(item.ChangedAt);
        const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        if (!timeMap.has(timeLabel)) {
          timeMap.set(timeLabel, {
            name: timeLabel,
            originalKey: item.ChangedAt
          });
        }
        
        const resultItem = timeMap.get(timeLabel)!;
        const val1 = parseFloat(item.NewValue_1);
        const val2 = parseFloat(item.NewValue_2);
        const isByProduct = item.ByProduct;
        
        if (isByProduct) {
          resultItem[`KPI ${kpiId} (Produto 1)`] = isNaN(val1) ? 0 : val1;
          resultItem[`KPI ${kpiId} (Produto 2)`] = isNaN(val2) ? 0 : val2;
        } else {
          resultItem[`KPI ${kpiId}`] = isNaN(val1) ? 0 : val1;
        }
      });
      
      return Array.from(timeMap.values());
    }

    // For other groupings, merge both series ensuring all time periods are represented
    const allTimeKeys = new Set([
      ...primaryData.map(item => item.originalKey || item.name),
      ...secondaryData.map(item => item.originalKey || item.name)
    ]);

    const primaryMap = new Map();
    primaryData.forEach(item => {
      primaryMap.set(item.originalKey || item.name, item);
    });

    const secondaryMap = new Map();
    secondaryData.forEach(item => {
      secondaryMap.set(item.originalKey || item.name, item);
    });

    const result = Array.from(allTimeKeys).sort().map(timeKey => {
      const primaryItem = primaryMap.get(timeKey);
      const secondaryItem = secondaryMap.get(timeKey);
      
      const resultItem: ProcessedChartData = {
        name: primaryItem?.name || secondaryItem?.name || timeKey
      };

      // Copy primary data if available
      if (primaryItem) {
        Object.keys(primaryItem).forEach(key => {
          if (key !== 'name' && key !== 'originalKey') {
            resultItem[key] = primaryItem[key];
          }
        });
      }

      // Add secondary data if available
      if (secondaryItem) {
        Object.keys(secondaryItem).forEach(key => {
          if (key !== 'name' && key !== 'originalKey') {
            resultItem[key] = secondaryItem[key];
          }
        });
      }

      return resultItem;
    });
    
    console.log("ChartDataProcessor: Combined result:", result);
    return result;
  };

  return {
    chartData,
    loading,
    kpiUnits
  };
};
