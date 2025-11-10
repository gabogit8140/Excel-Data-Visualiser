import React from 'react';
import { ChartData } from '../lib/types';

interface DataTablePreviewProps {
    data: ChartData;
}

const DataTablePreview: React.FC<DataTablePreviewProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-slate-400">No data to display.</div>;
    }
    const headers = Object.keys(data[0]);
    const previewRows = data.slice(0, 10);
    return (
        <div className="overflow-x-auto h-full">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-300 uppercase bg-slate-700">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-4 py-2">{header}</th>
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
