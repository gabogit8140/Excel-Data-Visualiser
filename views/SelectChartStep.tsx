import React from 'react';
import { CHART_DEFINITIONS } from '../lib/constants';
import { ChartDefinition } from '../lib/types';

interface SelectChartStepProps {
    dataSourceName: string;
    onChartSelect: (chart: ChartDefinition) => void;
}

const SelectChartStep: React.FC<SelectChartStepProps> = ({ dataSourceName, onChartSelect }) => {
    const categories = ['Standard', 'Advanced', 'Animated'];

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-4">Choose a Visualization</h2>
            <p className="text-slate-400 mb-8">
                Data from <span className="font-semibold text-cyan-400">{dataSourceName}</span> is ready. Select a chart type.
            </p>
            {categories.map(category => (
                <div key={category}>
                    <h3 className="text-xl font-semibold text-slate-300 mt-6 mb-3 border-b border-slate-700 pb-2">
                        {category} Charts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CHART_DEFINITIONS
                            .filter(c => c.category === category)
                            .map(chart => (
                                <button
                                    key={chart.id}
                                    onClick={() => onChartSelect(chart)}
                                    className="p-4 bg-slate-800 rounded-lg text-left hover:bg-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all flex flex-col h-full"
                                >
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{chart.name}</p>
                                        <p className="text-xs text-indigo-400 font-mono mb-2">{chart.library}</p>
                                        <p className="text-sm text-slate-400">{chart.description}</p>
                                    </div>
                                </button>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SelectChartStep;
