import { useState, useEffect } from "react";
import { fetchKPIValueHistory, fetchUserKPIs, KPIValueHistory } from "@/services/kpiService";
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

  const loadTimeBasedData = async () => {
    const zKpiId = zAxis;
    console.log("ChartDataProcessor: Fetching history for KPI:", zKpiId);
    
    const history = await fetchKPIValueHistory(zKpiId);
    console.log("ChartDataProcessor: Raw history data:", history);
    
    // Get KPI units information
    const units: {[key: string]: string} = {};
    if (history.length > 0 && history[0].Unit) {
      units[zAxis] = history[0].Unit;
    }
    
    // Group data by time period based on xAxis selection
    const groupedData = formatGraphData(history, xAxis, zAxis);
    console.log("ChartDataProcessor: Grouped data:", groupedData);
    
    // If yAxis is selected, also load its data
    let yAxisData: ProcessedChartData[] = [];
    if (yAxis && yAxis !== "none") {
      const yKpiId = yAxis;
      console.log("ChartDataProcessor: Fetching Y-axis history for KPI:", yKpiId);
      const yHistory = await fetchKPIValueHistory(yKpiId);
      
      if (yHistory.length > 0 && yHistory[0].Unit) {
        units[yAxis] = yHistory[0].Unit;
      }
      
      yAxisData = formatGraphData(yHistory, xAxis, yAxis);
      console.log("ChartDataProcessor: Y-axis data:", yAxisData);
    }
    
    setKpiUnits(units);
    
    // Combine the data for multi-series display
    const processedData = combineSeriesData(groupedData, yAxisData, zAxis, yAxis);
    
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
        const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString('pt-PT', { month: 'short' })}`;
        
        const resultItem: ProcessedChartData = {
          name: timeLabel,
          originalKey: item.ChangedAt
        };

        if (isByProduct) {
          resultItem[`KPI ${kpiId} (Produto 1)`] = isNaN(val1) ? 0 : val1;
          resultItem[`KPI ${kpiId} (Produto 2)`] = isNaN(val2) ? 0 : val2;
        } else {
          resultItem[`KPI ${kpiId} (Valor)`] = isNaN(val1) ? 0 : val1;
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
        resultItem[`KPI ${kpiId} (Valor)`] = grouped[key].NewValue_1;
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
    yAxisName: string
  ): ProcessedChartData[] => {
    console.log("ChartDataProcessor: combineSeriesData input:", { primaryData, secondaryData, zAxisName, yAxisName });
    
    if (!secondaryData.length) {
      console.log("ChartDataProcessor: Primary only result:", primaryData);
      return primaryData;
    }

    // Combine both series
    // Create a map of secondary data by time key
    const secondaryMap = new Map();
    secondaryData.forEach(item => {
      secondaryMap.set(item.name, item);
    });

    const result = primaryData.map(item => {
      const secondaryItem = secondaryMap.get(item.name);
      const resultItem: ProcessedChartData = {
        name: item.name
      };

      // Copy primary data
      Object.keys(item).forEach(key => {
        if (key !== 'name' && key !== 'originalKey') {
          resultItem[key] = item[key];
        }
      });

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
