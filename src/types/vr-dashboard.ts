
// Types for VR Dashboard components
export interface VRPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  width: number;
  height: number;
  depth: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export interface Chart {
  id: string;
  chartType: string;
  position: VRPosition;
  xAxis: string;
  yAxis: string;
  zAxis: string;
  color: string;
}

export interface ChartConfig {
  charts: Chart[];
  activeChartId: string;
}

export const defaultPosition: VRPosition = {
  x: 0,
  y: 1,
  z: -2,
  scale: 1,
  width: 1,
  height: 1, 
  depth: 1,
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
};

// Chart colors
export const CHART_COLORS = [
  "#1E90FF", "#FF6384", "#4BC0C0", "#9370DB", 
  "#FF9F40", "#36A2EB", "#FFCE56", "#9966FF"
];
