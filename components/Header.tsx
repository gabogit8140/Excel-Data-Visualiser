import React from 'react';
import Icon from './Icon';

interface HeaderProps {
    onNewProject: () => void;
    onSaveProject: () => void;
    onShowCatalogue: () => void;
    onBack: () => void;
    catalogueCount: number;
    showBackButton: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewProject, onSaveProject, onShowCatalogue, onBack, catalogueCount, showBackButton }) => (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Excel Data <span className="text-cyan-400">Visualizer</span></h1>
            <p className="text-slate-400 mt-1">Instantly create powerful charts from your spreadsheets.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {showBackButton && (
                <button onClick={onBack} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors">
                    <Icon name="back" className="w-5 h-5" />
                    <span>Back</span>
                </button>
            )}
            <button onClick={onShowCatalogue} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors">
                <span>{`My Catalogue (${catalogueCount})`}</span>
            </button>
            <button onClick={onSaveProject} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors" title="Save Project">
                <Icon name="save" className="w-5 h-5" />
                <span>Save Project</span>
            </button>
            <button onClick={onNewProject} className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors" title="Start a New Project">
                <span>New Project</span>
            </button>
        </div>
    </header>
);

export default Header;
