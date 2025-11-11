export type Step = 'upload' | 'selectData' | 'selectChart' | 'mapColumns' | 'visualize';
export type View = 'creator' | 'catalogue';
export type ChartData = any[];
export type ColumnType = 'auto' | 'text' | 'numeric' | 'date';
export type ColumnTypeOverrides = { [columnName: string]: ColumnType };

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

export type FilterType = 'numeric_range' | 'categorical_in';
export type NumericRangeFilterValue = [number, number];
export type CategoricalInFilterValue = (string | number)[];

export interface Filter {
  column: string;
  type: FilterType;
  value: NumericRangeFilterValue | CategoricalInFilterValue;
}

export interface ColumnFormatOptions {
  notation?: 'standard' | 'compact';
  dateFormat?: 'Default' | 'yyyy-mm-dd' | 'm/d/yy' | 'mmm-yy' | 'General';
}

export interface FormatOptions {
  [columnName: string]: ColumnFormatOptions;
}

export interface AxisOptions {
  display: boolean;
  title: string;
}

export interface LegendOptions {
  display: boolean;
  position: 'top' | 'left' | 'bottom' | 'right';
}

export interface ChartOptions {
  title: {
    display: boolean;
    text: string;
  };
  xAxis: AxisOptions;
  yAxis: AxisOptions;
  legend: LegendOptions;
  colorPalette: string; // The name of the palette from constants
}

export interface SavedVisualization {
    id: number;
    title: string;
    chartDefinition: ChartDefinition;
    dataSourceName: string;
    chartData: ChartData;
    fileName: string;
    columnMapping: ColumnMapping;
    filters?: Filter[];
    formatOptions?: FormatOptions;
    chartOptions?: ChartOptions;
    columnTypeOverrides?: ColumnTypeOverrides;
};

// Add global declaration for showSaveFilePicker
declare global {
  interface Window {
    showSaveFilePicker: (options?: any) => Promise<any>;
  }
}