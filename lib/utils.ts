import type { WorkBook, WorkSheet } from 'xlsx';
import { ChartData, DataSource, Filter, NumericRangeFilterValue, CategoricalInFilterValue, ColumnFormatOptions, ColumnTypeOverrides } from './types';

declare var XLSX: any;
declare var d3: any;

export { ColumnFormatOptions };

export const extractDataFromSource = (
    source: DataSource,
    wb: WorkBook,
    setError: (message: string) => void
): ChartData | null => {
    try {
        let data: any[] = [];
        if (source.type === 'Sheet') {
            data = XLSX.utils.sheet_to_json(wb.Sheets[source.name]);
        } else if (source.type === 'Table') {
            for (const sheetName of wb.SheetNames) {
                const ws: WorkSheet = wb.Sheets[sheetName];
                const table = ws['!tables']?.find((t: any) => t.name === source.name);
                if (table) {
                    const sheetData = XLSX.utils.sheet_to_json(ws, { range: table.ref, header: 1 });
                    if (sheetData.length > 0) {
                        const headers: string[] = sheetData[0];
                        data = sheetData.slice(1).map((row: any[]) => {
                            const rowObj: { [key: string]: any } = {};
                            headers.forEach((header, index) => {
                                rowObj[header] = row[index];
                            });
                            return rowObj;
                        });
                    }
                    break;
                }
            }
        }
        if (data.length > 0) {
            return data;
        }
        setError(`Data source "${source.name}" is empty or could not be read.`);
        return null;
    } catch (err) {
        console.error(err);
        setError('Failed to extract data from the selected source.');
        return null;
    }
};

export const getColumnTypes = (
    data: ChartData,
    overrides: ColumnTypeOverrides = {}
): { [key: string]: 'numeric' | 'text' | 'date' } => {
    if (!data || data.length === 0) return {};
    const columnTypes: { [key: string]: 'numeric' | 'text' | 'date' } = {};
    const headers = Object.keys(data[0]);
    
    headers.forEach(header => {
        const override = overrides[header];
        if (override && override !== 'auto') {
            columnTypes[header] = override;
            return;
        }

        // Check the first 10 rows to determine the type
        const isNumeric = data.slice(0, 10).every(row => 
            row[header] === null || 
            row[header] === undefined || 
            typeof row[header] === 'number'
        );
        columnTypes[header] = isNumeric ? 'numeric' : 'text';
    });

    return columnTypes;
};

export const applyFilters = (data: ChartData, filters: Filter[]): ChartData => {
  if (!filters || filters.length === 0) {
    return data;
  }

  return data.filter(row => {
    return filters.every(filter => {
      const rowValue = row[filter.column];
      if (rowValue === null || rowValue === undefined) return false;

      switch (filter.type) {
        case 'numeric_range': {
          const [min, max] = filter.value as NumericRangeFilterValue;
          const numericVal = parseFloat(rowValue);
          if (isNaN(numericVal)) return false;
          return numericVal >= min && numericVal <= max;
        }
        case 'categorical_in': {
          const selectedValues = filter.value as CategoricalInFilterValue;
          return selectedValues.includes(String(rowValue));
        }
        default:
          return true;
      }
    });
  });
};

export const formatValue = (
  value: any,
  options: ColumnFormatOptions | undefined,
  // FIX: Allow 'date' type for dataType to match ColumnType and fix ChartRenderer usage.
  dataType: 'numeric' | 'text' | 'date' = 'text'
): string => {
  if (value === null || value === undefined) return '';

  if (options) {
    // Date formatting takes precedence
    if (options.dateFormat && options.dateFormat !== 'Default' && (typeof value === 'number' || !isNaN(Date.parse(value)))) {
      try {
        // Use a known base date for Excel serial numbers (1900-01-01 is day 1, but Excel has a leap year bug for 1900, so SSF handles this)
        if (typeof value === 'number' && value > 0) {
            return XLSX.SSF.format(options.dateFormat, value);
        }
        // Handle standard date strings
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            // Basic manual formatting for common cases if SSF fails for strings
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            switch(options.dateFormat) {
                case 'yyyy-mm-dd': return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                case 'm/d/yy': return `${month}/${day}/${String(year).slice(-2)}`;
                case 'mmm-yy': return `${date.toLocaleString('default', { month: 'short' })}-${String(year).slice(-2)}`;
            }
        }
      } catch (e) {
        console.warn('Date formatting failed', e);
      }
    }

    // Number formatting
    if (dataType === 'numeric' && typeof value === 'number') {
      if (options.notation === 'compact') {
        return d3.format('.2s')(value);
      }
    }
  }

  if (typeof value === 'number') {
      return value.toLocaleString();
  }
  
  return String(value);
};