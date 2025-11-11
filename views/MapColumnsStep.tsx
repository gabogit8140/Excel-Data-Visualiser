import React, { useState, useMemo } from 'react';
import { ChartDefinition, ChartData, ColumnMapping, Filter, ColumnTypeOverrides } from '../lib/types';
import { getColumnTypes, applyFilters } from '../lib/utils';
import FilterPanel from '../components/FilterPanel';
import DataTablePreview from '../components/DataTablePreview';

interface MapColumnsStepProps {
    chart: ChartDefinition;
    data: ChartData;
    onColumnsMapped: (mapping: ColumnMapping) => void;
    existingMapping: ColumnMapping;
    filters: Filter[];
    onFiltersChange: (filters: Filter[]) => void;
    columnTypeOverrides: ColumnTypeOverrides;
}

const MapColumnsStep: React.FC<MapColumnsStepProps> = ({ chart, data, onColumnsMapped, existingMapping, filters, onFiltersChange, columnTypeOverrides }) => {
    const [mapping, setMapping] = useState<ColumnMapping>(existingMapping || {});

    const columnTypes = useMemo(() => getColumnTypes(data, columnTypeOverrides), [data, columnTypeOverrides]);
    const allColumns = useMemo(() => Object.keys(data[0] || {}), [data]);
    const numericColumns = useMemo(() => allColumns.filter(c => columnTypes[c] === 'numeric'), [allColumns, columnTypes]);
    const textColumns = useMemo(() => allColumns.filter(c => columnTypes[c] === 'text' || columnTypes[c] === 'date'), [allColumns, columnTypes]);

    const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);

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
            <h2 className="text-3xl font-bold text-white mb-2">Map Columns & Filter Data</h2>
            <p className="text-slate-400 mb-6">
                Assign columns to the chart dimensions for <span className="font-semibold text-cyan-400">{chart.name}</span>. You can also filter the data before visualizing.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column Mapping Section */}
                <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-6">1. Map Chart Dimensions</h3>
                    <div className="space-y-4 max-w-xl">
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
                </div>

                {/* Filters & Preview Section */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-semibold text-white mb-4">2. Apply Filters (Optional)</h3>
                        <div className="flex-grow min-h-[300px]">
                            <FilterPanel
                                data={data}
                                filters={filters}
                                onFiltersChange={onFiltersChange}
                                columnTypeOverrides={columnTypeOverrides}
                            />
                        </div>
                    </div>
                    <div className="flex-shrink-0 bg-slate-800/50 p-4 rounded-lg h-64 flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-300 mb-2 flex-shrink-0">
                            Filtered Data Preview
                        </h3>
                        <p className="text-sm text-slate-400 mb-2 flex-shrink-0">
                            Showing {filteredData.length} of {data.length} rows.
                        </p>
                        <div className="flex-grow overflow-auto">
                            <DataTablePreview data={filteredData} />
                        </div>
                    </div>
                </div>
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