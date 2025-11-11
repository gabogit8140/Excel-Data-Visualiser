import React, { useMemo, useState } from 'react';
import { SavedVisualization, Filter, FormatOptions, ColumnMapping, ChartDefinition, ChartData, ChartOptions, ColumnTypeOverrides } from '../lib/types';
import ChartRenderer from '../components/ChartRenderer';
import Icon from '../components/Icon';
import FilterPanel from '../components/FilterPanel';
import FormatPanel from '../components/FormatPanel';
import CustomizePanel from '../components/CustomizePanel';
import { applyFilters } from '../lib/utils';

interface VisualizeStepProps {
    onSaveToCatalogue: () => void;
    vizData: {
        id: number;
        title: string;
        chartData: ChartData;
        chartDefinition: ChartDefinition;
        dataSourceName: string;
        fileName: string;
        columnMapping: ColumnMapping;
    };
    filters: Filter[];
    onFiltersChange: (filters: Filter[]) => void;
    formatOptions: FormatOptions;
    onFormatOptionsChange: (options: FormatOptions) => void;
    chartOptions: ChartOptions;
    onChartOptionsChange: (options: ChartOptions) => void;
    columnTypeOverrides: ColumnTypeOverrides;
}

const TabButton: React.FC<{ name: string, activeTab: string, setActiveTab: (name: string) => void }> = ({ name, activeTab, setActiveTab }) => {
    const isActive = activeTab === name.toLowerCase();
    return (
        <button
            onClick={() => setActiveTab(name.toLowerCase())}
            className={`flex-1 py-2.5 px-4 text-center font-semibold transition-all duration-200 text-sm border-b-2 ${
                isActive
                    ? 'border-cyan-500 text-white'
                    : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
        >
            {name}
        </button>
    );
};

const VisualizeStep: React.FC<VisualizeStepProps> = ({
    onSaveToCatalogue,
    vizData,
    filters,
    onFiltersChange,
    formatOptions,
    onFormatOptionsChange,
    chartOptions,
    onChartOptionsChange,
    columnTypeOverrides,
}) => {
    const { chartDefinition, dataSourceName, chartData, columnMapping } = vizData;
    const [activeTab, setActiveTab] = useState('filters');

    const filteredChartData = useMemo(() => {
        return applyFilters(chartData, filters);
    }, [chartData, filters]);

    const finalVizData: SavedVisualization = {
        ...vizData,
        chartData: filteredChartData,
        filters: filters,
        formatOptions: formatOptions,
        chartOptions: chartOptions,
        columnTypeOverrides: columnTypeOverrides,
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0">
                <h2 className="text-3xl font-bold text-white mb-2">{chartOptions.title.text || chartDefinition.name}</h2>
                <p className="text-slate-400 mb-4">
                    Visualizing data from <span className="font-semibold text-cyan-400">{dataSourceName}</span>.
                    Showing {filteredChartData.length} of {chartData.length} rows.
                </p>
            </div>

            <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4 shadow-lg flex flex-col">
                    <ChartRenderer viz={finalVizData} />
                </div>
                <div className="lg:col-span-1 min-h-[300px] lg:min-h-0 bg-slate-800/70 rounded-lg flex flex-col">
                    <div className="flex border-b border-slate-700 flex-shrink-0">
                        <TabButton name="Filters" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton name="Formatting" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton name="Customize" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                    <div className="flex-grow overflow-hidden">
                        {activeTab === 'filters' && (
                            <FilterPanel
                                data={chartData}
                                filters={filters}
                                onFiltersChange={onFiltersChange}
                                columnTypeOverrides={columnTypeOverrides}
                            />
                        )}
                        {activeTab === 'formatting' && (
                            <FormatPanel
                                columnMapping={columnMapping}
                                data={chartData}
                                formatOptions={formatOptions}
                                onFormatOptionsChange={onFormatOptionsChange}
                            />
                        )}
                        {activeTab === 'customize' && (
                           <CustomizePanel 
                                options={chartOptions}
                                onOptionsChange={onChartOptionsChange}
                           />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 pt-6 flex items-center justify-end">
                <button
                    onClick={onSaveToCatalogue}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors"
                >
                    <Icon name="save" className="w-5 h-5" />
                    <span>Save to Catalogue</span>
                </button>
            </div>
        </div>
    );
};

export default VisualizeStep;