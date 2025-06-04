
import { useChartData } from "@/hooks/useChartData";
import { ChartDataManagerProps } from "@/types/chartDataTypes";

const ChartDataManager = ({ children }: { children: (props: any) => React.ReactNode }) => {
  const chartDataProps = useChartData();
  
  return children(chartDataProps);
};

export default ChartDataManager;
