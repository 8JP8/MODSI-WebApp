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
      console.log("Loading chart data for:", { zAxis, xAxis, yAxis });
      
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
    const zKpiId = zAxis.split('-')[0];
    const history = await fetchKPIValueHistory(zKpiId);
    
    // Group data by time period based on xAxis selection
    const groupedData = groupByTimePeriod(history, xAxis);
    
    // If yAxis is selected, also load its data
    let yAxisData: { [key: string]: { value1: number; value2: number } } = {};
    if (yAxis && yAxis !== "none") {
      const yKpiId = yAxis.split('-')[0];
      const yHistory = await fetchKPIValueHistory(yKpiId);
      yAxisData = groupByTimePeriod(yHistory, xAxis);
    }
    
    // Combine the data
    const processedData = Object.keys(groupedData).map(period => {
      const zData = groupedData[period];
      const dataPoint: ProcessedChartData = {
        name: period,
        [`${zAxis.split('-')[0]} (1)`]: zData.value1,
        [`${zAxis.split('-')[0]} (2)`]: zData.value2
      };
      
      if (yAxis && yAxis !== "none" && yAxisData[period]) {
        const yData = yAxisData[period];
        dataPoint[`${yAxis.split('-')[0]} (1)`] = yData.value1;
        dataPoint[`${yAxis.split('-')[0]} (2)`] = yData.value2;
      }
      
      return dataPoint;
    }).sort((a, b) => {
      return new Date(a.name).getTime() - new Date(b.name).getTime();
    });
    
    console.log("Processed time-based data:", processedData);
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
    
    console.log("Processed product-based data:", processedData);
    setChartData(processedData);
  };

  const groupByTimePeriod = (history: KPIValueHistory[], period: string): { [key: string]: { value1: number; value2: number } } => {
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
    const result: { [key: string]: { value1: number; value2: number } } = {};
    Object.keys(grouped).forEach(key => {
      const sortedEntries = grouped[key].sort((a, b) => 
        new Date(b.ChangedAt).getTime() - new Date(a.ChangedAt).getTime()
      );
      const latestEntry = sortedEntries[0];
      result[key] = {
        value1: parseFloat(latestEntry.NewValue_1) || 0,
        value2: parseFloat(latestEntry.NewValue_2) || 0
      };
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

  return {
    chartData,
    loading
  };
};
