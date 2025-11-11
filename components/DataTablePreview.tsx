import React from 'react';
import { ChartData, ColumnType, ColumnTypeOverrides } from '../lib/types';

interface DataTablePreviewProps {
    data: ChartData;
    interactiveHeaders?: boolean;
    columnTypeOverrides?: ColumnTypeOverrides;
    onOverrideChange?: (column: string, type: ColumnType) => void;
}

const DataTablePreview: React.FC<DataTablePreviewProps> = ({
    data,
    interactiveHeaders = false,
    columnTypeOverrides = {},
    onOverrideChange
}) => {
    if (!data || data.length === 0) {
        return <div className="text-slate-400">No data to display.</div>;
    }
    const headers = Object.keys(data[0]);
    const previewRows = data.slice(0, 10);
    return (
        <div className="overflow-x-auto h-full">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-300 uppercase bg-slate-700 sticky top-0">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-4 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="truncate" title={header}>{header}</span>
                                    {interactiveHeaders && (
                                        <select
                                            value={columnTypeOverrides[header] || 'auto'}
                                            onChange={(e) => onOverrideChange?.(header, e.target.value as ColumnType)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="ml-2 bg-slate-800 border border-slate-600 rounded text-xs p-0.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                            aria-label={`Data type for ${header}`}
                                        >
                                            <option value="auto">Auto</option>
                                            <option value="text">Text</option>
                                            <option value="numeric">Number</option>
                                            <option value="date">Date</option>
                                        </select>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {previewRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-600">
                            {headers.map(header => (
                                <td key={`${rowIndex}-${header}`} className="px-4 py-2 truncate max-w-xs">
                                    {String(row[header])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length > 10 && (
                <p className="text-xs text-slate-500 mt-2">
                    Showing first 10 of {data.length} rows.
                </p>
            )}
        </div>
    );
};

export default DataTablePreview;