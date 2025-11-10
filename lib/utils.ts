import type { WorkBook, WorkSheet } from 'xlsx';
import { ChartData, DataSource } from './types';

declare var XLSX: any;

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

export const getColumnTypes = (data: ChartData): { [key: string]: 'numeric' | 'text' } => {
    if (!data || data.length === 0) return {};
    const columnTypes: { [key: string]: 'numeric' | 'text' } = {};
    const headers = Object.keys(data[0]);
    
    headers.forEach(header => {
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
