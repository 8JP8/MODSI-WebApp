
import ChartPreview from "@/components/ChartPreview";

interface ChartPreviewTabProps {
  chartType: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
}

const ChartPreviewTab = ({ chartType, data, xAxis, yAxis, zAxis }: ChartPreviewTabProps) => {
  return (
    <ChartPreview 
      chartType={chartType} 
      data={data} 
      xAxis={xAxis} 
      yAxis={yAxis} 
      zAxis={zAxis} 
    />
  );
};

export default ChartPreviewTab;
