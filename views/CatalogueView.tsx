import React from 'react';
import { SavedVisualization } from '../lib/types';
import Icon from '../components/Icon';

interface CatalogueViewProps {
    visualizations: SavedVisualization[];
    onAddNew: () => void;
    onDelete: (id: number) => void;
    onEdit: (viz: SavedVisualization) => void;
    onView: (viz: SavedVisualization) => void;
}

const CatalogueView: React.FC<CatalogueViewProps> = ({ visualizations, onAddNew, onDelete, onEdit, onView }) => (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white">My Catalogue</h2>
                <p className="text-slate-400">Here are your saved visualizations. You can view, edit, or delete them.</p>
            </div>
            <button
                onClick={onAddNew}
                className="mt-4 sm:mt-0 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors"
            >
                <Icon name="add" className="w-5 h-5" />
                <span>Add New Visualization</span>
            </button>
        </div>
        {visualizations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-400">You haven't saved any visualizations yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visualizations.map(viz => (
                    <div key={viz.id} className="bg-slate-800 rounded-lg shadow-lg flex flex-col">
                        <div className="p-4 flex-grow">
                            <h3 className="font-bold text-white text-lg truncate" title={viz.title}>{viz.title}</h3>
                            <p className="text-sm text-indigo-400 font-mono">{viz.chartDefinition.name}</p>
                            <p className="text-xs text-slate-400 mt-2">
                                Source: <span className="font-semibold">{viz.dataSourceName}</span> from <span className="font-semibold">{viz.fileName}</span>
                            </p>
                        </div>
                        <div className="p-4 bg-slate-900/50 flex justify-end items-center space-x-2 rounded-b-lg">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(viz.id);
                                }}
                                aria-label="Delete"
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <Icon name="delete" className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => onEdit(viz)}
                                className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold text-sm flex items-center space-x-2 transition-colors"
                            >
                                <Icon name="edit" className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={() => onView(viz)}
                                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold text-sm transition-colors"
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default CatalogueView;