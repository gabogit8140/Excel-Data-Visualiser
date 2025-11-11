import React from 'react';
import { ChartOptions } from '../lib/types';
import { COLOR_PALETTES } from '../lib/constants';

interface CustomizePanelProps {
    options: ChartOptions;
    onOptionsChange: (options: ChartOptions) => void;
}

const Toggle: React.FC<{ label: string, checked: boolean, onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-slate-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
        </div>
    </label>
);

const CustomizePanel: React.FC<CustomizePanelProps> = ({ options, onOptionsChange }) => {

    const handleOptionChange = <K extends keyof ChartOptions>(key: K, value: ChartOptions[K]) => {
        onOptionsChange({ ...options, [key]: value });
    };

    // FIX: Constrain K to keys of ChartOptions that have object values to ensure type safety with the spread operator.
    const handleSubOptionChange = <
        K extends 'title' | 'xAxis' | 'yAxis' | 'legend',
        SK extends keyof ChartOptions[K]
    >(
        key: K,
        subKey: SK,
        value: ChartOptions[K][SK]
    ) => {
        handleOptionChange(key, { ...options[key], [subKey]: value });
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-white flex-shrink-0">Customize Chart</h3>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {/* Chart Title */}
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <Toggle label="Show Title" checked={options.title.display} onChange={(val) => handleSubOptionChange('title', 'display', val)} />
                    {options.title.display && (
                        <input
                            type="text"
                            placeholder="Enter chart title"
                            value={options.title.text}
                            onChange={(e) => handleSubOptionChange('title', 'text', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 mt-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    )}
                </div>

                {/* X-Axis */}
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <Toggle label="Show X-Axis" checked={options.xAxis.display} onChange={(val) => handleSubOptionChange('xAxis', 'display', val)} />
                    {options.xAxis.display && (
                        <input
                            type="text"
                            placeholder="X-Axis Title"
                            value={options.xAxis.title}
                            onChange={(e) => handleSubOptionChange('xAxis', 'title', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 mt-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    )}
                </div>

                {/* Y-Axis */}
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <Toggle label="Show Y-Axis" checked={options.yAxis.display} onChange={(val) => handleSubOptionChange('yAxis', 'display', val)} />
                    {options.yAxis.display && (
                        <input
                            type="text"
                            placeholder="Y-Axis Title"
                            value={options.yAxis.title}
                            onChange={(e) => handleSubOptionChange('yAxis', 'title', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 mt-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    )}
                </div>
                
                {/* Legend */}
                <div className="bg-slate-900/50 p-3 rounded-md space-y-2">
                    <Toggle label="Show Legend" checked={options.legend.display} onChange={(val) => handleSubOptionChange('legend', 'display', val)} />
                    {options.legend.display && (
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Position</label>
                             <select
                                value={options.legend.position}
                                onChange={(e) => handleSubOptionChange('legend', 'position', e.target.value as ChartOptions['legend']['position'])}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            >
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Color Palette */}
                <div className="bg-slate-900/50 p-3 rounded-md">
                    <label className="text-sm text-slate-300 block mb-2">Color Palette</label>
                    <select
                        value={options.colorPalette}
                        onChange={(e) => handleOptionChange('colorPalette', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-1.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        {COLOR_PALETTES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CustomizePanel;