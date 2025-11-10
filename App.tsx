import React, { useState, useCallback, useEffect } from 'react';
import type { WorkBook } from 'xlsx';
import { extractDataFromSource } from './lib/utils';
import type { Step, View, ChartData, ChartDefinition, DataSource, SavedVisualization, ColumnMapping } from './lib/types';

// Import Views (Steps)
import UploadStep from './views/UploadStep';
import SelectDataStep from './views/SelectDataStep';
import SelectChartStep from './views/SelectChartStep';
import MapColumnsStep from './views/MapColumnsStep';
import VisualizeStep from './views/VisualizeStep';
import CatalogueView from './views/CatalogueView';

// Import Components
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Spinner from './components/Spinner';
import ChartRenderer from './components/ChartRenderer';

// Declare global variables from CDN scripts
declare var XLSX: any;

export default function App() {
    const [view, setView] = useState<View>('creator');
    const [step, setStep] = useState<Step>('upload');
    const [workbook, setWorkbook] = useState<WorkBook | null>(null);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
    const [chartData, setChartData] = useState<ChartData>([]);
    const [selectedChart, setSelectedChart] = useState<ChartDefinition | null>(null);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [previewData, setPreviewData] = useState<ChartData | null>(null);
    const [previewingSource, setPreviewingSource] = useState<DataSource | null>(null);
    const [savedVisualizations, setSavedVisualizations] = useState<SavedVisualization[]>([]);
    const [viewingSavedChart, setViewingSavedChart] = useState<SavedVisualization | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newVizTitle, setNewVizTitle] = useState('');

    useEffect(() => {
        try {
            const stored = localStorage.getItem('excel-visualizer-saved');
            if (stored) setSavedVisualizations(JSON.parse(stored));
        } catch (e) {
            console.error("Could not load saved visualizations.", e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('excel-visualizer-saved', JSON.stringify(savedVisualizations));
    }, [savedVisualizations]);

    const softReset = useCallback(() => {
        setStep('upload');
        setWorkbook(null);
        setDataSources([]);
        setSelectedDataSource(null);
        setChartData([]);
        setSelectedChart(null);
        setColumnMapping({});
        setError(null);
        setFileName('');
        setPreviewData(null);
        setPreviewingSource(null);
        setView('creator');
    }, []);
    
    const handleNewProject = useCallback(() => {
        setSavedVisualizations([]);
        softReset();
    }, [softReset]);

    const handleBack = useCallback(() => {
        if (viewingSavedChart) {
            setViewingSavedChart(null);
            return;
        }
        switch (step) {
            case 'visualize':
                setStep('mapColumns');
                break;
            case 'mapColumns':
                setStep('selectChart');
                setColumnMapping({});
                break;
            case 'selectChart':
                setStep('selectData');
                setSelectedChart(null);
                break;
            case 'selectData':
                softReset();
                break;
        }
    }, [step, softReset, viewingSavedChart]);
    
    const handleStepNavigation = useCallback((targetStep: Step) => {
        const steps: Step[] = ['upload', 'selectData', 'selectChart', 'mapColumns', 'visualize'];
        const currentStepIndex = steps.indexOf(step);
        const targetStepIndex = steps.indexOf(targetStep);

        if (targetStepIndex >= currentStepIndex) return;

        // Reset state based on where we are going back to
        if (targetStepIndex < steps.indexOf('mapColumns')) {
            setColumnMapping({});
        }
        if (targetStepIndex < steps.indexOf('selectChart')) {
            setSelectedChart(null);
        }
        if (targetStepIndex < steps.indexOf('selectData')) {
            // Going back to upload step is a soft reset
            softReset(); 
            return;
        }
        
        setStep(targetStep);
    }, [step, softReset]);

    const handleFile = useCallback((file: File) => {
        setIsLoading(true);
        setError(null);
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                setWorkbook(wb);
                const sources: DataSource[] = wb.SheetNames.map(name => ({ name, type: 'Sheet' }));
                wb.SheetNames.forEach(sheetName => {
                    const ws = wb.Sheets[sheetName];
                    if (ws['!tables']) {
                        ws['!tables'].forEach((table: any) => sources.push({ name: table.name, type: 'Table' }));
                    }
                });
                setDataSources(sources);
                setStep('selectData');
            } catch (err) {
                console.error(err);
                setError('Failed to parse the Excel file.');
                setStep('upload');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleProjectFile = (file: File) => {
        setIsLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target?.result as string);
                setSavedVisualizations(project.savedVisualizations || []);
                setFileName(project.originalFileName || file.name.replace('.xlviz', ''));
                setView('catalogue');
            } catch (err) {
                setError("Failed to parse project file.");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handlePreviewDataSource = useCallback((source: DataSource) => {
        if (workbook) {
            setPreviewData(extractDataFromSource(source, workbook, setError));
            setPreviewingSource(source);
        }
    }, [workbook]);

    const selectDataSource = useCallback((source: DataSource) => {
        if (workbook) {
            const data = extractDataFromSource(source, workbook, setError);
            if (data) {
                setChartData(data);
                setSelectedDataSource(source);
                setStep('selectChart');
            }
        }
    }, [workbook]);

    const handleChartSelect = useCallback((chart: ChartDefinition) => {
        setSelectedChart(chart);
        setStep('mapColumns');
    }, []);

    const handleColumnsMapped = useCallback((mapping: ColumnMapping) => {
        setColumnMapping(mapping);
        setStep('visualize');
    }, []);

    const handleSaveToCatalogue = useCallback(() => {
        if (!selectedChart || !selectedDataSource || !newVizTitle.trim()) {
            setError("Please provide a title.");
            return;
        }
        const newVisualization: SavedVisualization = {
            id: Date.now(),
            title: newVizTitle.trim(),
            chartDefinition: selectedChart,
            dataSourceName: selectedDataSource.name,
            chartData: chartData,
            fileName: fileName,
            columnMapping: columnMapping
        };
        setSavedVisualizations(prev => [...prev, newVisualization]);
setShowSaveModal(false);
        setNewVizTitle('');
        setView('catalogue');
    }, [selectedChart, selectedDataSource, newVizTitle, chartData, fileName, columnMapping]);

    const handleDeleteFromCatalogue = (idToDelete: number) => {
        setSavedVisualizations(currentVisualizations =>
            currentVisualizations.filter(viz => viz.id !== idToDelete)
        );
    };

    const handleEditVisualization = useCallback((vizToEdit: SavedVisualization) => {
        setChartData(vizToEdit.chartData);
        setSelectedDataSource({ name: vizToEdit.dataSourceName, type: 'Sheet' });
        setFileName(vizToEdit.fileName);
        setSelectedChart(vizToEdit.chartDefinition);
        setColumnMapping(vizToEdit.columnMapping);
        setStep('mapColumns');
        setView('creator');
    }, []);

    const handleSaveProject = useCallback(async () => {
        if (savedVisualizations.length === 0) {
            setError("Your catalogue is empty. There is nothing to save.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        const projectData = { savedVisualizations, originalFileName: fileName, version: "1.0.0" };
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const safeFileName = (fileName.split('.')[0] || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeFileName}.xlviz`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    }, [savedVisualizations, fileName]);

    const renderContent = () => {
        if (isLoading) return <Spinner />;
        if (view === 'catalogue') {
            return <CatalogueView
                visualizations={savedVisualizations}
                onAddNew={softReset}
                onDelete={handleDeleteFromCatalogue}
                onEdit={handleEditVisualization}
                onView={setViewingSavedChart}
            />;
        }

        switch (step) {
            case 'upload':
                return <UploadStep onFileSelect={handleFile} onProjectSelect={handleProjectFile} />;
            case 'selectData':
                return <SelectDataStep
                    dataSources={dataSources}
                    fileName={fileName}
                    onDataSourceSelect={selectDataSource}
                    onPreview={handlePreviewDataSource}
                    previewData={previewData}
                    previewingSource={previewingSource}
                />;
            case 'selectChart':
                return <SelectChartStep
                    dataSourceName={selectedDataSource?.name || ''}
                    onChartSelect={handleChartSelect}
                />;
            case 'mapColumns':
                return selectedChart && chartData.length > 0 && <MapColumnsStep
                    chart={selectedChart}
                    data={chartData}
                    onColumnsMapped={handleColumnsMapped}
                    existingMapping={columnMapping}
                />;
            case 'visualize':
                return selectedChart && selectedDataSource && <VisualizeStep
                    chartDefinition={selectedChart}
                    dataSourceName={selectedDataSource.name}
                    onSaveToCatalogue={() => setShowSaveModal(true)}
                    vizData={{
                        id: Date.now(),
                        title: selectedChart.name,
                        chartData,
                        chartDefinition: selectedChart,
                        dataSourceName: selectedDataSource.name,
                        fileName,
                        columnMapping,
                    }}
                />;
            default:
                return <p>Something went wrong.</p>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Header
                    onNewProject={handleNewProject}
                    onSaveProject={handleSaveProject}
                    onShowCatalogue={() => setView('catalogue')}
                    onBack={handleBack}
                    catalogueCount={savedVisualizations.length}
                    showBackButton={view === 'creator' && step !== 'upload'}
                />
                {view === 'creator' && <ProgressBar currentStep={step} onStepClick={handleStepNavigation} />}
                <main className={`p-6 bg-slate-800/50 rounded-lg shadow-2xl min-h-[50vh] flex flex-col justify-center`}>
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-md mb-6">
                            <strong>Error:</strong> {error}
                            <button onClick={() => setError(null)} className="float-right font-bold">X</button>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Save Visualization</h3>
                        <p className="text-slate-400 mb-4">Give your new visualization a title.</p>
                        <input
                            type="text"
                            value={newVizTitle}
                            onChange={e => setNewVizTitle(e.target.value)}
                            placeholder="e.g., Q3 Sales Performance"
                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold">Cancel</button>
                            <button onClick={handleSaveToCatalogue} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold">Save</button>
                        </div>
                    </div>
                </div>
            )}
            {viewingSavedChart && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-40" onClick={() => setViewingSavedChart(null)}>
                     <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{viewingSavedChart.title}</h3>
                                <p className="text-slate-400 text-sm">{viewingSavedChart.chartDefinition.name} from {viewingSavedChart.dataSourceName}</p>
                            </div>
                            <button onClick={() => setViewingSavedChart(null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-grow min-h-0">
                           <ChartRenderer viz={viewingSavedChart} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}