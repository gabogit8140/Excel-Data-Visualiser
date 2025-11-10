import React from 'react';
import { Step } from '../lib/types';

interface ProgressBarProps {
    currentStep: Step;
    onStepClick: (step: Step) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, onStepClick }) => {
    const steps: Step[] = ['upload', 'selectData', 'selectChart', 'mapColumns', 'visualize'];
    const currentStepIndex = steps.indexOf(currentStep);

    const stepLabels: { [key in Step]: string } = {
        upload: 'Upload',
        selectData: 'Select Data',
        selectChart: 'Select Chart',
        mapColumns: 'Map Columns',
        visualize: 'Visualize'
    };

    return (
        <div className="w-full mb-8">
            <div className="flex">
                {steps.map((s, i) => (
                    <div key={s} className="flex-1">
                        <div className={`h-1 transition-colors ${currentStepIndex >= i ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                        <button
                            onClick={() => onStepClick(s)}
                            disabled={i >= currentStepIndex}
                            className={`mt-2 text-xs text-center capitalize w-full transition-colors ${
                                currentStepIndex > i 
                                    ? 'text-cyan-400 font-semibold cursor-pointer hover:text-cyan-300' 
                                    : currentStepIndex === i 
                                        ? 'text-cyan-400 font-semibold' 
                                        : 'text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {stepLabels[s]}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;