
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataIndicatorSelectorProps {
  availableIndicators: string[];
  onSelectXAxis: (indicator: string) => void;
  onSelectYAxis: (indicator: string) => void;
  onSelectZAxis?: (indicator: string) => void;
  selectedX: string;
  selectedY: string;
  selectedZ?: string;
  chartType: string;
}

const DataIndicatorSelector = ({
  availableIndicators,
  onSelectXAxis,
  onSelectYAxis,
  onSelectZAxis,
  selectedX,
  selectedY,
  selectedZ,
  chartType,
}: DataIndicatorSelectorProps) => {
  const isPieChart = chartType === "pie";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPieChart ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <Select value={selectedX} onValueChange={onSelectXAxis}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((indicator) => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Values</label>
              <Select value={selectedY} onValueChange={onSelectYAxis}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select values" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((indicator) => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">X Axis</label>
              <Select value={selectedX} onValueChange={onSelectXAxis}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select X axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((indicator) => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Y Axis</label>
              <Select value={selectedY} onValueChange={onSelectYAxis}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Y axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((indicator) => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {onSelectZAxis && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Z Axis (Optional)</label>
                <Select value={selectedZ || ""} onValueChange={onSelectZAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Z axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {availableIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataIndicatorSelector;
