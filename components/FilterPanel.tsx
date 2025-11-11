import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChartData, Filter, CategoricalInFilterValue, NumericRangeFilterValue, ColumnTypeOverrides, FilterType } from '../lib/types';
import { getColumnTypes, formatValue } from '../lib/utils';
import Icon from './Icon';

// Add global declaration for XLSX from CDN
declare var XLSX: any;

interface FilterPanelProps {
    data: ChartData;
    filters: Filter[];
    onFiltersChange: (filters: Filter[]) => void;
    columnTypeOverrides: ColumnTypeOverrides;
}

const CategoricalFilterControl: React.FC<{
    filter: Filter;
    data: ChartData;
    onChange: (column: string, newValue: any) => void;
    columnType: 'text' | 'numeric' | 'date';
}> = ({ filter, data, onChange, columnType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isDate = columnType === 'date';

    const { uniqueFormattedValues, valueMap } = useMemo(() => {
        const uniqueRaw = [...new Set(data.map(row => row[filter.column]))];
        const formatted = uniqueRaw.map(raw => ({
            raw: String(raw),
            formatted: isDate ? formatValue(raw, { dateFormat: 'yyyy-mm-dd' }) : String(raw),
        }));
        formatted.sort((a, b) => a.formatted.localeCompare(b.formatted));
        const map = new Map(formatted.map(item => [item.raw, item.formatted]));
        return { uniqueFormattedValues: formatted, valueMap: map };
    }, [data, filter.column, isDate]);

    const selectedValues = useMemo(() =>
        new Set((filter.value as CategoricalInFilterValue).map(String)),
        [filter.value]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);


    const filteredValues = useMemo(() => {
        if (!searchTerm) return uniqueFormattedValues;
        return uniqueFormattedValues.filter(val => val.formatted.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [uniqueFormattedValues, searchTerm]);

    const handleToggle = (rawValue: string) => {
        const newSelectedValues = new Set(selectedValues);
        if (newSelectedValues.has(rawValue)) {
            newSelectedValues.delete(rawValue);
        } else {
            newSelectedValues.add(rawValue);
        }
        onChange(filter.column, Array.from(newSelectedValues));
    };

    const handleSelectAll = () => onChange(filter.column, uniqueFormattedValues.map(item => item.raw));
    const handleClearAll = () => onChange(filter.column, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-white flex justify-between items-center"
            >
                <span>{selectedValues.size} selected</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-2 z-10">
                    <input
                        type="text"
                        placeholder={`Search values...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md p-1 mb-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                    <div className="flex justify-between items-center text-xs mb-1 px-1 py-2 border-b border-slate-700">
                        <button onClick={handleSelectAll} className="text-cyan-400 hover:text-cyan-300 font-semibold">Select All</button>
                        <button onClick={handleClearAll} className="text-red-400 hover:text-red-300 font-semibold">Clear</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredValues.map(item => (
                            <label key={item.raw} className="flex items-center space-x-2 p-1 rounded hover:bg-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.has(item.raw)}
                                    onChange={() => handleToggle(item.raw)}
                                    className="h-4 w-4 bg-slate-900 border-slate-600 text-cyan-600 focus:ring-cyan-500 rounded flex-shrink-0"
                                />
                                <span className="text-sm text-slate-300 truncate" title={item.formatted}>{item.formatted}</span>
                            </label>
                        ))}
                        {filteredValues.length === 0 && (
                            <div className="flex items-center justify-center h-full p-2">
                                <p className="text-sm text-slate-500">No matching values.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedValues.size > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(selectedValues).slice(0, 15).map(rawValue => {
                        const formattedValue = valueMap.get(rawValue) || rawValue;
                        return (
                            <div key={rawValue} className="bg-indigo-600/50 text-indigo-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                                <span className="truncate max-w-[100px]">{formattedValue}</span>
                                <button onClick={() => handleToggle(rawValue)} className="ml-1.5 text-indigo-200 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )
                    })}
                    {selectedValues.size > 15 && (
                        <div className="bg-slate-600 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
                            + {selectedValues.size - 15} more
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const FilterPanel: React.FC<FilterPanelProps> = ({ data, filters, onFiltersChange, columnTypeOverrides }) => {
    const [isAddFilterPopoverOpen, setIsAddFilterPopoverOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);
    const addButtonRef = useRef<HTMLButtonElement>(null);

    const columnTypes = useMemo(() => getColumnTypes(data, columnTypeOverrides), [data, columnTypeOverrides]);
    const allColumns = useMemo(() => Object.keys(data[0] || {}), [data]);
    const filterableColumns = useMemo(() => {
        return allColumns
            .filter(c => !filters.some(f => f.column === c))
            .filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allColumns, filters, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isAddFilterPopoverOpen &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                addButtonRef.current &&
                !addButtonRef.current.contains(event.target as Node)
            ) {
                setIsAddFilterPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddFilterPopoverOpen]);

    const handleAddFilter = (column: string) => {
        if (!column) return;

        const columnType = columnTypes[column];
        let filterType: FilterType;
        let defaultValue: NumericRangeFilterValue | CategoricalInFilterValue;

        if (columnType === 'numeric' || columnType === 'date') {
            filterType = 'numeric_range';
            const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
            const min = values.length > 0 ? Math.min(...values) : 0;
            const max = values.length > 0 ? Math.max(...values) : 0;
            defaultValue = [min, max];
        } else { // 'text'
            filterType = 'categorical_in';
            defaultValue = [...new Set(data.map(row => String(row[column])))];
        }

        onFiltersChange([...filters, {
            column: column,
            type: filterType,
            value: defaultValue,
        }]);
        setSearchTerm('');
        setIsAddFilterPopoverOpen(false);
    };

    const handleRemoveFilter = (column: string) => {
        onFiltersChange(filters.filter(f => f.column !== column));
    };

    const handleFilterValueChange = (column: string, newValue: any) => {
        onFiltersChange(filters.map(f => f.column === column ? { ...f, value: newValue } : f));
    };
    
    const renderFilterControl = (filter: Filter) => {
        const columnType = columnTypes[filter.column];

        if (filter.type === 'numeric_range') {
            const [min, max] = filter.value as NumericRangeFilterValue;

            if (columnType === 'date') {
                const ymdMin = min > 0 ? XLSX.SSF.format('yyyy-mm-dd', min) : '';
                const ymdMax = max > 0 ? XLSX.SSF.format('yyyy-mm-dd', max) : '';

                const handleDateChange = (type: 'min' | 'max', ymdValue: string) => {
                    if (!ymdValue) return;
                    const dateParts = ymdValue.split('-').map(Number);
                    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                    const serial = XLSX.SSF.datenum(date);

                    if (type === 'min') {
                        handleFilterValueChange(filter.column, [serial, max]);
                    } else {
                        handleFilterValueChange(filter.column, [min, serial]);
                    }
                };

                return (
                     <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={ymdMin}
                            onChange={e => handleDateChange('min', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-1 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                            style={{ colorScheme: 'dark' }}
                            aria-label={`Min date for ${filter.column}`}
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={ymdMax}
                            onChange={e => handleDateChange('max', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-1 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                            style={{ colorScheme: 'dark' }}
                            aria-label={`Max date for ${filter.column}`}
                        />
                    </div>
                );
            }

            const values = data.map(row => parseFloat(row[filter.column])).filter(v => !isNaN(v));
            const dataMin = values.length > 0 ? Math.min(...values) : 0;
            const dataMax = values.length > 0 ? Math.max(...values) : 0;

            return (
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        value={min}
                        min={dataMin}
                        max={dataMax}
                        onChange={e => handleFilterValueChange(filter.column, [parseFloat(e.target.value) || 0, max])}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-1 text-sm text-white"
                        aria-label={`Min value for ${filter.column}`}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="number"
                        value={max}
                        min={dataMin}
                        max={dataMax}
                        onChange={e => handleFilterValueChange(filter.column, [min, parseFloat(e.target.value) || 0])}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-1 text-sm text-white"
                        aria-label={`Max value for ${filter.column}`}
                    />
                </div>
            )
        }
        if (filter.type === 'categorical_in') {
            return (
                <CategoricalFilterControl 
                    filter={filter}
                    data={data}
                    onChange={handleFilterValueChange}
                    columnType={columnTypes[filter.column]}
                />
            )
        }
        return null;
    }

    return (
        <div className="bg-slate-800/70 rounded-lg p-4 h-full flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-white flex-shrink-0">Filters</h3>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {filters.length === 0 && <p className="text-slate-400 text-sm">No filters applied. Add one below.</p>}
                {filters.map(filter => (
                    <div key={filter.column} className="bg-slate-900/50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-slate-300 text-sm truncate pr-2" title={filter.column}>{filter.column}</label>
                            <button onClick={() => handleRemoveFilter(filter.column)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <Icon name="delete" className="w-4 h-4" />
                            </button>
                        </div>
                        {renderFilterControl(filter)}
                    </div>
                ))}
            </div>
            <div className="flex-shrink-0 border-t border-slate-700 pt-4 relative">
                 <button
                    ref={addButtonRef}
                    onClick={() => setIsAddFilterPopoverOpen(!isAddFilterPopoverOpen)}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition-colors text-sm flex items-center justify-center space-x-2"
                >
                    <Icon name="add" className="w-5 h-5" />
                    <span>Add Filter</span>
                </button>
                {isAddFilterPopoverOpen && (
                    <div ref={popoverRef} className="absolute bottom-full mb-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-20">
                        <input
                            type="text"
                            placeholder="Search columns..."
                            autoFocus
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <ul className="max-h-48 overflow-y-auto">
                            {filterableColumns.length > 0 ? filterableColumns.map(col => (
                                <li key={col}>
                                <button
                                    onClick={() => handleAddFilter(col)}
                                    className="w-full text-left p-2 rounded hover:bg-indigo-600 text-sm text-slate-300 hover:text-white"
                                >
                                    {col}
                                </button>
                                </li>
                            )) : (
                                <li className="p-2 text-sm text-slate-500">No more columns to filter.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;