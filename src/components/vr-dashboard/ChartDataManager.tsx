
import { useChartData } from "@/hooks/useChartData";
import { ChartDataManagerProps } from "@/types/chartDataTypes";

const ChartDataManager = ({ children, sampleData }: ChartDataManagerProps) => {
  const chartDataProps = useChartData(sampleData);
  
  return children(chartDataProps);
};

export default ChartDataManager;
