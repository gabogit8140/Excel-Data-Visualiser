import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { WorkBook } from 'xlsx';
import { extractDataFromSource, applyFilters } from './lib/utils';
import type { Step, View, ChartData, ChartDefinition, DataSource, SavedVisualization, ColumnMapping, Filter, FormatOptions, ChartOptions, ColumnTypeOverrides } from './lib/types';

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
import FilterPanel from './components/FilterPanel';
import FormatPanel from './components/FormatPanel';
import CustomizePanel from './components/CustomizePanel';


// Declare global variables from CDN scripts
declare var XLSX: any;

const defaultChartOptions: ChartOptions = {
    title: { display: true, text: '' },
    xAxis: { display: true, title: '' },
    yAxis: { display: true, title: '' },
    legend: { display: true, position: 'top' },
    colorPalette: 'Default',
};

export default function App() {
    const [view, setView] = useState<View>('creator');
    const [step, setStep] = useState<Step>('upload');
    const [workbook, setWorkbook] = useState<WorkBook | null>(null);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
    const [chartData, setChartData] = useState<ChartData>([]);
    const [selectedChart, setSelectedChart] = useState<ChartDefinition | null>(null);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
    const [filters, setFilters] = useState<Filter[]>([]);
    const [formatOptions, setFormatOptions] = useState<FormatOptions>({});
    const [chartOptions, setChartOptions] = useState<ChartOptions>(defaultChartOptions);
    const [columnTypeOverrides, setColumnTypeOverrides] = useState<ColumnTypeOverrides>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [previewData, setPreviewData] = useState<ChartData | null>(null);
    const [previewingSource, setPreviewingSource] = useState<DataSource | null>(null);
    const [savedVisualizations, setSavedVisualizations] = useState<SavedVisualization[]>([]);
    const [viewingSavedChart, setViewingSavedChart] = useState<SavedVisualization | null>(null);
    const [modalFilters, setModalFilters] = useState<Filter[]>([]);
    const [modalFormatOptions, setModalFormatOptions] = useState<FormatOptions>({});
    const [modalChartOptions, setModalChartOptions] = useState<ChartOptions>(defaultChartOptions);
    const [modalColumnTypeOverrides, setModalColumnTypeOverrides] = useState<ColumnTypeOverrides>({});
    const [modalActiveTab, setModalActiveTab] = useState('filters');
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

    useEffect(() => {
        if (viewingSavedChart) {
            setModalFilters(viewingSavedChart.filters || []);
            setModalFormatOptions(viewingSavedChart.formatOptions || {});
            setModalChartOptions(viewingSavedChart.chartOptions || { ...defaultChartOptions, title: { ...defaultChartOptions.title, text: viewingSavedChart.title } });
            setModalColumnTypeOverrides(viewingSavedChart.columnTypeOverrides || {});
        } else {
            setModalFilters([]);
            setModalFormatOptions({});
            setModalChartOptions(defaultChartOptions);
            setModalColumnTypeOverrides({});
        }
    }, [viewingSavedChart]);

    const softReset = useCallback(() => {
        setStep('upload');
        setWorkbook(null);
        setDataSources([]);
        setSelectedDataSource(null);
        setChartData([]);
        setSelectedChart(null);
        setColumnMapping({});
        setFilters([]);
        setFormatOptions({});
        setChartOptions(defaultChartOptions);
        setColumnTypeOverrides({});
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
                setFilters([]);
                setFormatOptions({});
                setChartOptions(defaultChartOptions);
                break;
            case 'selectChart':
                setStep('selectData');
                setSelectedChart(null);
                setColumnTypeOverrides({});
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

        if (targetStepIndex < steps.indexOf('mapColumns')) {
            setColumnMapping({});
            setFilters([]);
            setFormatOptions({});
            setChartOptions(defaultChartOptions);
        }
        if (targetStepIndex < steps.indexOf('selectChart')) {
            setSelectedChart(null);
            setColumnTypeOverrides({});
        }
        if (targetStepIndex < steps.indexOf('selectData')) {
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
        setColumnMapping({});
        setFilters([]);
        setFormatOptions({});
        setChartOptions({ ...defaultChartOptions, title: { ...defaultChartOptions.title, text: chart.name } });
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
            columnMapping: columnMapping,
            filters: filters,
            formatOptions: formatOptions,
            chartOptions: { ...chartOptions, title: { ...chartOptions.title, text: newVizTitle.trim() } },
            columnTypeOverrides: columnTypeOverrides,
        };
        setSavedVisualizations(prev => [...prev, newVisualization]);
        setShowSaveModal(false);
        setNewVizTitle('');
        setView('catalogue');
    }, [selectedChart, selectedDataSource, newVizTitle, chartData, fileName, columnMapping, filters, formatOptions, chartOptions, columnTypeOverrides]);

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
        setFilters(vizToEdit.filters || []);
        setFormatOptions(vizToEdit.formatOptions || {});
        setChartOptions(vizToEdit.chartOptions || { ...defaultChartOptions, title: { ...defaultChartOptions.title, text: vizToEdit.title } });
        setColumnTypeOverrides(vizToEdit.columnTypeOverrides || {});
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
                    columnTypeOverrides={columnTypeOverrides}
                    onOverridesChange={setColumnTypeOverrides}
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
                    filters={filters}
                    onFiltersChange={setFilters}
                    columnTypeOverrides={columnTypeOverrides}
                />;
            case 'visualize':
                return selectedChart && selectedDataSource && <VisualizeStep
                    onSaveToCatalogue={() => setShowSaveModal(true)}
                    filters={filters}
                    onFiltersChange={setFilters}
                    formatOptions={formatOptions}
                    onFormatOptionsChange={setFormatOptions}
                    chartOptions={chartOptions}
                    onChartOptionsChange={setChartOptions}
                    columnTypeOverrides={columnTypeOverrides}
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
    
    const filteredVizForModal = useMemo(() => {
        if (!viewingSavedChart) return null;
        return {
            ...viewingSavedChart,
            chartData: applyFilters(viewingSavedChart.chartData, modalFilters),
            formatOptions: modalFormatOptions,
            chartOptions: modalChartOptions,
            columnTypeOverrides: modalColumnTypeOverrides,
        };
    }, [viewingSavedChart, modalFilters, modalFormatOptions, modalChartOptions, modalColumnTypeOverrides]);

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
                     <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{filteredVizForModal?.chartOptions?.title.text || viewingSavedChart.title}</h3>
                                <p className="text-slate-400 text-sm">{viewingSavedChart.chartDefinition.name} from {viewingSavedChart.dataSourceName}</p>
                            </div>
                            <button onClick={() => setViewingSavedChart(null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-full bg-slate-800 rounded-lg p-4 shadow-lg flex flex-col">
                                {filteredVizForModal && <ChartRenderer viz={filteredVizForModal} />}
                           </div>
                           <div className="lg:col-span-1 min-h-[300px] lg:min-h-0 bg-slate-800/70 rounded-lg flex flex-col">
                                <div className="flex border-b border-slate-700 flex-shrink-0">
                                    <button onClick={() => setModalActiveTab('filters')} className={`flex-1 py-2.5 px-4 text-center font-semibold transition-all duration-200 text-sm border-b-2 ${modalActiveTab === 'filters' ? 'border-cyan-500 text-white' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}>Filters</button>
                                    <button onClick={() => setModalActiveTab('formatting')} className={`flex-1 py-2.5 px-4 text-center font-semibold transition-all duration-200 text-sm border-b-2 ${modalActiveTab === 'formatting' ? 'border-cyan-500 text-white' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}>Formatting</button>
                                    <button onClick={() => setModalActiveTab('customize')} className={`flex-1 py-2.5 px-4 text-center font-semibold transition-all duration-200 text-sm border-b-2 ${modalActiveTab === 'customize' ? 'border-cyan-500 text-white' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}>Customize</button>
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    {modalActiveTab === 'filters' && viewingSavedChart && (
                                        <FilterPanel
                                            data={viewingSavedChart.chartData}
                                            filters={modalFilters}
                                            onFiltersChange={setModalFilters}
                                            columnTypeOverrides={modalColumnTypeOverrides}
                                        />
                                    )}
                                    {modalActiveTab === 'formatting' && viewingSavedChart && (
                                        <FormatPanel
                                            data={viewingSavedChart.chartData}
                                            columnMapping={viewingSavedChart.columnMapping}
                                            formatOptions={modalFormatOptions}
                                            onFormatOptionsChange={setModalFormatOptions}
                                        />
                                    )}
                                    {modalActiveTab === 'customize' && viewingSavedChart && (
                                        <CustomizePanel
                                            options={modalChartOptions}
                                            onOptionsChange={setModalChartOptions}
                                        />
                                    )}
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}