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
      setChartData([]);
      return;
    }

    loadChartData();
  }, [zAxis, xAxis, yAxis]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      if (xAxis === "product") {
        await loadProductBasedData();
      } else {
        await loadTimeBasedData();
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do gráfico");
      console.error("Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeBasedData = async () => {
    const history = await fetchKPIValueHistory(zAxis);
    const isValue1 = zAxis.endsWith('-1');
    
    // Group data by time period based on xAxis selection
    const groupedData = groupByTimePeriod(history, xAxis, isValue1);
    
    // If yAxis is selected, also load its data
    let yAxisData: { [key: string]: number } = {};
    if (yAxis && yAxis !== "none") {
      const yHistory = await fetchKPIValueHistory(yAxis);
      const isYValue1 = yAxis.endsWith('-1');
      yAxisData = groupByTimePeriod(yHistory, xAxis, isYValue1);
    }
    
    // Combine the data
    const processedData = Object.keys(groupedData).map(period => ({
      name: period,
      [getIndicatorName(zAxis)]: groupedData[period],
      ...(yAxis && yAxis !== "none" ? { [getIndicatorName(yAxis)]: yAxisData[period] || 0 } : {})
    })).sort((a, b) => {
      // Sort chronologically
      return new Date(a.name).getTime() - new Date(b.name).getTime();
    });
    
    setChartData(processedData);
  };

  const loadProductBasedData = async () => {
    const zKpiId = zAxis.split('-')[0];
    const history = await fetchKPIValueHistory(zKpiId);
    
    // Group by day and get the latest values for each product
    const dailyData = groupByDay(history);
    
    const processedData = Object.keys(dailyData).map(day => {
      const dayData = dailyData[day];
      return {
        name: day,
        "Produto 1": parseFloat(dayData.NewValue_1) || 0,
        "Produto 2": parseFloat(dayData.NewValue_2) || 0
      };
    }).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    
    setChartData(processedData);
  };

  const groupByTimePeriod = (history: KPIValueHistory[], period: string, isValue1: boolean): { [key: string]: number } => {
    const grouped: { [key: string]: KPIValueHistory[] } = {};
    
    history.forEach(entry => {
      const date = new Date(entry.ChangedAt);
      let key: string;
      
      switch (period) {
        case "days":
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case "months":
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case "years":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    
    // For each period, get the latest value
    const result: { [key: string]: number } = {};
    Object.keys(grouped).forEach(key => {
      const sortedEntries = grouped[key].sort((a, b) => 
        new Date(b.ChangedAt).getTime() - new Date(a.ChangedAt).getTime()
      );
      const latestEntry = sortedEntries[0];
      const value = isValue1 ? latestEntry.NewValue_1 : latestEntry.NewValue_2;
      result[key] = parseFloat(value) || 0;
    });
    
    return result;
  };

  const groupByDay = (history: KPIValueHistory[]): { [key: string]: KPIValueHistory } => {
    const grouped: { [key: string]: KPIValueHistory } = {};
    
    history.forEach(entry => {
      const day = new Date(entry.ChangedAt).toISOString().split('T')[0];
      
      // Keep only the latest entry for each day
      if (!grouped[day] || new Date(entry.ChangedAt) > new Date(grouped[day].ChangedAt)) {
        grouped[day] = entry;
      }
    });
    
    return grouped;
  };

  const getIndicatorName = (axisId: string): string => {
    // Remove the -1 or -2 suffix for display
    return axisId.replace(/-[12]$/, '');
  };

  return {
    chartData,
    loading
  };
};
