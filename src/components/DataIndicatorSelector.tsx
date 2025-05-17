
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartTypeSelector from "./ChartTypeSelector";

interface DataIndicatorSelectorProps {
  availableIndicators: string[];
  onSelectXAxis: (indicator: string) => void;
  onSelectYAxis: (indicator: string) => void;
  onSelectZAxis?: (indicator: string) => void;
  selectedX: string;
  selectedY: string;
  selectedZ?: string;
  chartType: string;
  onSelectChartType: (type: string) => void;
  departments?: string[];
  selectedDepartment?: string;
  onDepartmentChange?: (department: string) => void;
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
  onSelectChartType,
  departments = [],
  selectedDepartment = "",
  onDepartmentChange,
}: DataIndicatorSelectorProps) => {
  const isPieChart = chartType === "pie";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type Section */}
        <ChartTypeSelector 
          selectedType={chartType} 
          onSelect={onSelectChartType} 
        />
        
        <div className="border-t border-slate-700 pt-5">
          <h3 className="text-lg font-semibold mb-4">Data Indicators</h3>
          
          {departments.length > 0 && onDepartmentChange && (
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Selected Department</label>
              <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {isPieChart ? (
            <>
              <div className="space-y-2 mb-4">
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
              <div className="space-y-2 mb-4">
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
              <div className="space-y-2 mb-4">
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
                  <Select value={selectedZ || "none"} onValueChange={onSelectZAxis}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Z axis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default DataIndicatorSelector;
