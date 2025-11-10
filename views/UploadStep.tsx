import React, { useRef, useCallback } from 'react';
import Icon from '../components/Icon';

interface UploadStepProps {
    onFileSelect: (file: File) => void;
    onProjectSelect: (file: File) => void;
}

const Dropzone: React.FC<{
    onFile: (file: File) => void;
    title: string;
    description: string;
    accept: string;
    icon: string;
}> = ({ onFile, title, description, accept, icon }) => {
    const dropRef = useRef<HTMLLabelElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            dropRef.current?.classList.add('border-cyan-500', 'bg-slate-700');
        } else {
            dropRef.current?.classList.remove('border-cyan-500', 'bg-slate-700');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropRef.current?.classList.remove('border-cyan-500', 'bg-slate-700');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFile(e.dataTransfer.files[0]);
        }
    }, [onFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFile(e.target.files[0]);
        }
    };

    return (
        <label
            ref={dropRef}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className="relative block w-full p-10 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors text-center"
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <Icon name={icon} className="w-12 h-12 text-slate-500" />
                <span className="font-semibold text-slate-300">{title}</span>
                <span className="text-sm text-slate-500">{description}</span>
            </div>
            <input type="file" className="sr-only" accept={accept} onChange={handleChange} />
        </label>
    );
};

const UploadStep: React.FC<UploadStepProps> = ({ onFileSelect, onProjectSelect }) => {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Start or Load a Project</h2>
            <p className="text-slate-400 mb-8">Upload a spreadsheet to begin, or load a previous project file.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Dropzone
                    onFile={onFileSelect}
                    title="New from Spreadsheet"
                    description="Upload a .xlsx file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    icon="upload"
                />
                <Dropzone
                    onFile={onProjectSelect}
                    title="Load Project"
                    description="Upload a .xlviz file"
                    accept=".xlviz,application/json"
                    icon="project"
                />
            </div>
        </div>
    );
};

export default UploadStep;