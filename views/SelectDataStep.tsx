import React from 'react';
import { DataSource, ChartData } from '../lib/types';
import Icon from '../components/Icon';
import DataTablePreview from '../components/DataTablePreview';

interface SelectDataStepProps {
    dataSources: DataSource[];
    fileName: string;
    onDataSourceSelect: (source: DataSource) => void;
    onPreview: (source: DataSource) => void;
    previewData: ChartData | null;
    previewingSource: DataSource | null;
}

const SelectDataStep: React.FC<SelectDataStepProps> = ({
    dataSources,
    fileName,
    onDataSourceSelect,
    onPreview,
    previewData,
    previewingSource
}) => (
    <div>
        <h2 className="text-3xl font-bold text-white mb-2">Select Data Source</h2>
        <p className="text-slate-400 mb-6">
            Choose a sheet or table from <span className="font-semibold text-cyan-400">{fileName}</span> to visualize.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
            <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">Available Sources</h3>
                <div className="overflow-y-auto pr-2 flex-grow">
                    {dataSources.map(source => (
                        <div key={`${source.type}-${source.name}`} className="p-3 bg-slate-800 rounded-lg mb-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <Icon name={source.type === 'Sheet' ? 'sheet' : 'table'} className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                                <div className="truncate">
                                    <p className="font-semibold text-white truncate" title={source.name}>{source.name}</p>
                                    <p className="text-sm text-slate-400">{source.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button onClick={() => onPreview(source)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-xs font-semibold rounded-md">Preview</button>
                                <button onClick={() => onDataSourceSelect(source)} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-md">Select</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-3 flex-shrink-0">
                    Data Preview {previewingSource && <span className="text-cyan-400 font-normal ml-2">{previewingSource.name}</span>}
                </h3>
                <div className="flex-grow overflow-auto">
                    {previewData ? <DataTablePreview data={previewData} /> : <div className="h-full flex items-center justify-center text-slate-500">Click "Preview" on a data source.</div>}
                </div>
            </div>
        </div>
    </div>
);

export default SelectDataStep;
