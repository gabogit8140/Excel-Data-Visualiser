import React, { useMemo } from 'react';
import { ChartData, FormatOptions, ColumnMapping, ColumnFormatOptions } from '../lib/types';
import { getColumnTypes } from '../lib/utils';

interface FormatPanelProps {
    data: ChartData;
    columnMapping: ColumnMapping;
    formatOptions: FormatOptions;
    onFormatOptionsChange: (options: FormatOptions) => void;
}

const FormatPanel: React.FC<FormatPanelProps> = ({ data, columnMapping, formatOptions, onFormatOptionsChange }) => {
    const columnTypes = useMemo(() => getColumnTypes(data), [data]);

    const mappedColumns = useMemo(() => {
        return [...new Set(Object.values(columnMapping).flatMap(c => c.split(',').filter(Boolean)))];
    }, [columnMapping]);

    const handleOptionChange = (column: string, optionKey: keyof ColumnFormatOptions, value: string) => {
        onFormatOptionsChange({
            ...formatOptions,
            [column]: {
                ...(formatOptions[column] || {}),
                [optionKey]: value,
            },
        });
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-white flex-shrink-0">Formatting</h3>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {mappedColumns.length === 0 && <p className="text-slate-400 text-sm">No columns mapped to chart dimensions.</p>}
                {mappedColumns.map(column => {
                    const columnType = columnTypes[column];
                    const options = formatOptions[column] || {};

                    return (
                        <div key={column} className="bg-slate-900/50 p-3 rounded-md">
                            <label className="font-semibold text-slate-300 text-sm truncate pr-2" title={column}>
                                {column}
                            </label>
                            <div className="space-y-3 mt-2">
                                {columnType === 'numeric' && (
                                    <div>
                                        <label htmlFor={`notation-${column}`} className="text-xs text-slate-400 block mb-1">Number Format</label>
                                        <select
                                            id={`notation-${column}`}
                                            value={options.notation || 'standard'}
                                            onChange={e => handleOptionChange(column, 'notation', e.target.value)}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="compact">Compact (e.g., 1.2K, 5M)</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor={`dateformat-${column}`} className="text-xs text-slate-400 block mb-1">Date Format (for numbers)</label>
                                    <select
                                        id={`dateformat-${column}`}
                                        value={options.dateFormat || 'Default'}
                                        onChange={e => handleOptionChange(column, 'dateFormat', e.target.value)}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                    >
                                        <option value="Default">Default</option>
                                        <option value="yyyy-mm-dd">2023-12-25</option>
                                        <option value="m/d/yy">12/25/23</option>
                                        <option value="mmm-yy">Dec-23</option>
                                        <option value="General">Excel General</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default FormatPanel;
