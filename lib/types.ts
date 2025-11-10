export type Step = 'upload' | 'selectData' | 'selectChart' | 'mapColumns' | 'visualize';
export type View = 'creator' | 'catalogue';
export type ChartData = any[];

export interface ChartDimension {
  id: string;
  name: string;
  type: 'numeric' | 'text' | 'any';
  required: boolean;
  multiple?: boolean;
}

export interface ChartDefinition {
  id: string;
  name: string;
  library: 'Chart.js' | 'Plotly.js' | 'D3.js';
  category: 'Standard' | 'Advanced' | 'Animated';
  description: string;
  dimensions: ChartDimension[];
};

export interface DataSource {
  name:string;
  type: 'Sheet' | 'Table';
};

export interface ColumnMapping {
  [dimensionId: string]: string; // Maps dimension ID to a column name (or comma-separated names)
}

export interface SavedVisualization {
    id: number;
    title: string;
    chartDefinition: ChartDefinition;
    dataSourceName: string;
    chartData: ChartData;
    fileName: string;
    columnMapping: ColumnMapping;
};

// Add global declaration for showSaveFilePicker
declare global {
  interface Window {
    showSaveFilePicker: (options?: any) => Promise<any>;
  }
}
