
import { Chart, VRPosition } from "./vr-dashboard";

export interface ChartDataManagerChildProps {
  charts: Chart[];
  activeChartId: string;
  chartType: string;
  position: VRPosition;
  zAxis: string;
  secondaryAxis: string;
  yAxis: string;
  data: any[];
  configSaved: boolean;
  loading?: boolean;
  setActiveChartId: (id: string) => void;
  updateActiveChart: (updates: Partial<Chart>) => void;
  handlePositionChange: (newPosition: VRPosition) => void;
  handleZAxisChange: (value: string) => void;
  handleSecondaryAxisChange: (value: string) => void;
  handleYAxisChange: (value: string) => void;
  addNewChart: () => void;
  resetConfiguration: () => void;
  handleLoadConfig: (config: any) => void;
  handleExportJSON: () => void;
  setConfigSaved: (saved: boolean) => void;
  getCurrentConfiguration: () => Promise<any>;
  getConfigurationForVR: () => Promise<any>;
  isConfigurationValid: () => boolean;
}

export interface ChartDataManagerProps {
  children: (props: ChartDataManagerChildProps) => React.ReactNode;
  sampleData: any;
}
