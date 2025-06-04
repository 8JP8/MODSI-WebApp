import { useState, useEffect } from "react";
import { fetchKPIValueHistory, KPIValueHistory } from "@/services/kpiService";
import { toast } from "sonner";

export interface ProcessedChartData {
  name: string;
  [key: string]: any;
}

export const useChartDataProcessor = (zAxis: string, xAxis: string, yAxis: string) => {
  const [chartData, setChartData] = useState<ProcessedChartData[]>([]);
  const [loading, setLoading] = useState(false);

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
    // Use the KPI ID directly (no more splitting by -)
    const zKpiId = zAxis;
    console.log("ChartDataProcessor: Fetching history for KPI:", zKpiId);
    
    const history = await fetchKPIValueHistory(zKpiId);
    console.log("ChartDataProcessor: Raw history data:", history);
    
    // Group data by time period based on xAxis selection
    const groupedData = formatGraphData(history, xAxis);
    console.log("ChartDataProcessor: Grouped data:", groupedData);
    
    // If yAxis is selected, also load its data
    let yAxisData: ProcessedChartData[] = [];
    if (yAxis && yAxis !== "none") {
      const yKpiId = yAxis;
      console.log("ChartDataProcessor: Fetching Y-axis history for KPI:", yKpiId);
      const yHistory = await fetchKPIValueHistory(yKpiId);
      yAxisData = formatGraphData(yHistory, xAxis);
      console.log("ChartDataProcessor: Y-axis data:", yAxisData);
    }
    
    // Combine the data for multi-series display
    const processedData = combineSeriesData(groupedData, yAxisData, zAxis, yAxis);
    
    console.log("ChartDataProcessor: Final processed data:", processedData);
    setChartData(processedData);
  };

  const formatGraphData = (rawData: KPIValueHistory[], groupBy: string): ProcessedChartData[] => {
    console.log("ChartDataProcessor: formatGraphData input:", { rawData, groupBy });
    
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

    // For "change" groupBy, keep all individual changes
    if (groupBy === "change") {
      const result = rawData.map((item, index) => {
        const val1 = parseFloat(item.NewValue_1);
        const val2 = parseFloat(item.NewValue_2);
        
        return {
          name: `Alteração ${rawData.length - index}`,
          "Produto 1": isNaN(val1) ? 0 : val1,
          "Produto 2": isNaN(val2) ? 0 : val2,
          originalKey: item.ChangedAt
        };
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

    const result = sortedKeys.map(key => ({
      name: formatLabel(key),
      "Produto 1": grouped[key].NewValue_1,
      "Produto 2": grouped[key].NewValue_2,
      originalKey: key
    }));
    
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
      // Only primary data - rename series to include KPI ID
      const result = primaryData.map(item => ({
        name: item.name,
        [`KPI ${zAxisName} (Produto 1)`]: item["Produto 1"],
        [`KPI ${zAxisName} (Produto 2)`]: item["Produto 2"]
      }));
      
      console.log("ChartDataProcessor: Primary only result:", result);
      return result;
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
        name: item.name,
        [`KPI ${zAxisName} (Produto 1)`]: item["Produto 1"],
        [`KPI ${zAxisName} (Produto 2)`]: item["Produto 2"]
      };

      if (secondaryItem) {
        resultItem[`KPI ${yAxisName} (Produto 1)`] = secondaryItem["Produto 1"];
        resultItem[`KPI ${yAxisName} (Produto 2)`] = secondaryItem["Produto 2"];
      }

      return resultItem;
    });
    
    console.log("ChartDataProcessor: Combined result:", result);
    return result;
  };

  return {
    chartData,
    loading
  };
};
