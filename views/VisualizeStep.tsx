import React from 'react';
import { ChartDefinition, SavedVisualization } from '../lib/types';
import ChartRenderer from '../components/ChartRenderer';
import Icon from '../components/Icon';

interface VisualizeStepProps {
    chartDefinition: ChartDefinition;
    dataSourceName: string;
    onSaveToCatalogue: () => void;
    vizData: SavedVisualization; // Pass the whole object needed for rendering
}

const VisualizeStep: React.FC<VisualizeStepProps> = ({
    chartDefinition,
    dataSourceName,
    onSaveToCatalogue,
    vizData
}) => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-4">{chartDefinition.name}</h2>
            <p className="text-slate-400 mb-4">
                Visualizing data from <span className="font-semibold text-cyan-400">{dataSourceName}</span>.
            </p>
            <div className="bg-slate-800 rounded-lg p-4 shadow-lg flex-grow flex flex-col min-h-0">
                <ChartRenderer viz={vizData} />
                <div className="flex-shrink-0 pt-4 flex items-center justify-end space-x-3 border-t border-slate-700 mt-4">
                     <button
                        onClick={onSaveToCatalogue}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors"
                     >
                        <Icon name="save" className="w-5 h-5" />
                        <span>Save to Catalogue</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualizeStep;
