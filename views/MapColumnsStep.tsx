import React, { useState, useMemo } from 'react';
import { ChartDefinition, ChartData, ColumnMapping } from '../lib/types';
import { getColumnTypes } from '../lib/utils';
import Icon from '../components/Icon';

interface MapColumnsStepProps {
    chart: ChartDefinition;
    data: ChartData;
    onColumnsMapped: (mapping: ColumnMapping) => void;
    existingMapping: ColumnMapping;
}

const MapColumnsStep: React.FC<MapColumnsStepProps> = ({ chart, data, onColumnsMapped, existingMapping }) => {
    const [mapping, setMapping] = useState<ColumnMapping>(existingMapping || {});

    const columnTypes = useMemo(() => getColumnTypes(data), [data]);
    const allColumns = useMemo(() => Object.keys(data[0] || {}), [data]);
    const numericColumns = useMemo(() => allColumns.filter(c => columnTypes[c] === 'numeric'), [allColumns, columnTypes]);
    const textColumns = useMemo(() => allColumns.filter(c => columnTypes[c] === 'text'), [allColumns, columnTypes]);

    const handleMappingChange = (dimensionId: string, columnName: string) => {
        setMapping(prev => ({ ...prev, [dimensionId]: columnName }));
    };
    
    const handleMultiSelectChange = (dimensionId: string, selectedColumns: string[]) => {
        setMapping(prev => ({ ...prev, [dimensionId]: selectedColumns.join(',') }));
    };

    const isMappingComplete = useMemo(() => {
        return chart.dimensions.every(dim => !dim.required || (mapping[dim.id] && mapping[dim.id].length > 0));
    }, [chart.dimensions, mapping]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Map Data Columns</h2>
            <p className="text-slate-400 mb-6">
                Assign columns from your data to the dimensions required by the <span className="font-semibold text-cyan-400">{chart.name}</span>.
            </p>
            <div className="space-y-4 max-w-2xl mx-auto">
                {chart.dimensions.map(dim => {
                    const relevantColumns = dim.type === 'numeric' ? numericColumns : (dim.type === 'text' ? textColumns : allColumns);
                    return (
                        <div key={dim.id} className="grid grid-cols-3 gap-4 items-center">
                            <label htmlFor={dim.id} className="text-right font-semibold text-slate-300">
                                {dim.name} {dim.required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="col-span-2">
                                {dim.multiple ? (
                                     <select
                                        multiple
                                        id={dim.id}
                                        value={(mapping[dim.id] || '').split(',').filter(Boolean)}
                                        onChange={e => handleMultiSelectChange(dim.id, Array.from(e.target.selectedOptions, option => option.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none h-24"
                                    >
                                        {relevantColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>
                                ) : (
                                    <select
                                        id={dim.id}
                                        value={mapping[dim.id] || ''}
                                        onChange={e => handleMappingChange(dim.id, e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                    >
                                        <option value="">Select a column...</option>
                                        {relevantColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end mt-8">
                <button
                    onClick={() => onColumnsMapped(mapping)}
                    disabled={!isMappingComplete}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                    <span>Visualize</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                </button>
            </div>
        </div>
    );
};

export default MapColumnsStep;
