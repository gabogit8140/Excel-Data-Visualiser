import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { WorkBook, WorkSheet } from 'xlsx';

// Declare global variables from CDN scripts
declare var XLSX: any;
declare var Chart: any;
declare var Plotly: any;
declare var d3: any;

// --- TYPE DEFINITIONS ---
type Step = 'upload' | 'selectData' | 'selectChart' | 'visualize';
type ChartData = any[];
type ChartDefinition = {
  id: string;
  name: string;
  library: 'Chart.js' | 'Plotly.js' | 'D3.js';
  category: 'Standard' | 'Advanced' | 'Animated';
  description: string;
};
type DataSource = {
  name: string;
  type: 'Sheet' | 'Table';
};


// --- CONSTANTS ---
const CHART_DEFINITIONS: ChartDefinition[] = [
    // Standard Charts
    { id: 'bar', name: 'Bar Chart', library: 'Chart.js', category: 'Standard', description: 'Compares values across categories.' },
    { id: 'line', name: 'Line Chart', library: 'Chart.js', category: 'Standard', description: 'Shows trends over time or ordered categories.' },
    { id: 'pie', name: 'Pie Chart', library: 'Chart.js', category: 'Standard', description: 'Displays proportions of a whole.' },
    { id: 'scatter', name: 'Scatter Plot', library: 'Chart.js', category: 'Standard', description: 'Shows relationships between two variables.' },
    { id: 'radar', name: 'Radar Chart', library: 'Chart.js', category: 'Standard', description: 'Compares multiple variables for different items.' },
    // Advanced Charts (Plotly.js)
    { id: 'heatmap', name: 'Heatmap', library: 'Plotly.js', category: 'Advanced', description: 'Visualizes magnitude of a phenomenon as color.' },
    { id: 'surface3d', name: '3D Surface Plot', library: 'Plotly.js', category: 'Advanced', description: 'Represents a three-dimensional dataset.' },
    { id: 'sunburst', name: 'Sunburst Chart', library: 'Plotly.js', category: 'Advanced', description: 'Visualizes hierarchical data spanning outwards.' },
    { id: 'treemap', name: 'Treemap', library: 'Plotly.js', category: 'Advanced', description: 'Displays hierarchical data using nested rectangles.' },
    { id: 'funnel', name: 'Funnel Chart', library: 'Plotly.js', category: 'Advanced', description: 'Represents stages in a process, like a sales pipeline.' },
    // Advanced Charts (D3.js)
    { id: 'force-directed', name: 'Force-Directed Graph', library: 'D3.js', category: 'Advanced', description: 'Shows network relationships. Requires "source", "target" columns.' },
    { id: 'dendrogram', name: 'Dendrogram', library: 'D3.js', category: 'Advanced', description: 'A tree diagram for hierarchical clustering.' },
    // Animated Charts
    { id: 'animated-bubble', name: 'Animated Bubble Chart', library: 'Plotly.js', category: 'Animated', description: 'Shows data changes over time with animated bubbles.' },
];


// --- HELPER FUNCTIONS & COMPONENTS ---

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
    // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const icons: { [key: string]: React.ReactElement } = {
        upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
        sheet: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        table: <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25m-17.25 0v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5m-17.25 0h17.25M3.375 6h17.25v10.5h-17.25V6z" />,
        chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
        visualize: <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.433-7.447A1 1 0 017.48 4h9.04a1 1 0 01.994.883l4.433 7.447a1.012 1.012 0 010 .639l-4.433 7.447a1 1 0 01-.994.883h-9.04a1 1 0 01-.995-.883l-4.433-7.447z" />,
        download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
        back: <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
            {icons[name]}
        </svg>
    );
};

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

const ChartRenderer: React.FC<{ data: ChartData; chartType: string; onSave: (format: 'png' | 'html') => void; }> = ({ data, chartType, onSave }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        const container = chartRef.current;
        container.innerHTML = ''; // Clear previous chart

        const destroyChart = () => {
            if (chartInstanceRef.current) {
                if (chartInstanceRef.current.destroy) {
                    chartInstanceRef.current.destroy(); // Chart.js
                } else if (chartInstanceRef.current.purge) {
                    Plotly.purge(container); // Plotly.js
                }
                chartInstanceRef.current = null;
            }
            container.innerHTML = ''; // D3 cleanup
        };
        
        destroyChart();

        const headers = Object.keys(data[0]);
        const labelCol = headers[0];
        const numericCols = headers.slice(1).filter(h => typeof data[0][h] === 'number');

        try {
            switch (chartType) {
                // --- Chart.js ---
                case 'bar':
                case 'line': {
                    const canvas = document.createElement('canvas');
                    container.appendChild(canvas);
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    chartInstanceRef.current = new Chart(ctx, {
                        type: chartType,
                        data: {
                            labels: data.map(row => row[labelCol]),
                            datasets: numericCols.map((col, i) => ({
                                label: col,
                                data: data.map(row => row[col]),
                                tension: chartType === 'line' ? 0.1 : undefined,
                            })),
                        },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                    break;
                }
                 case 'pie': {
                    const canvas = document.createElement('canvas');
                    container.appendChild(canvas);
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    chartInstanceRef.current = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: data.map(row => row[labelCol]),
                            datasets: [{
                                label: numericCols[0],
                                data: data.map(row => row[numericCols[0]]),
                            }],
                        },
                         options: { responsive: true, maintainAspectRatio: false }
                    });
                    break;
                }
                case 'scatter': {
                    const canvas = document.createElement('canvas');
                    container.appendChild(canvas);
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    chartInstanceRef.current = new Chart(ctx, {
                        type: 'scatter',
                        data: {
                            datasets: [{
                                label: `${numericCols[0]} vs ${numericCols[1]}`,
                                data: data.map(row => ({ x: row[numericCols[0]], y: row[numericCols[1]] })),
                            }],
                        },
                         options: { responsive: true, maintainAspectRatio: false }
                    });
                    break;
                }
                case 'radar': {
                     const canvas = document.createElement('canvas');
                    container.appendChild(canvas);
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    chartInstanceRef.current = new Chart(ctx, {
                        type: 'radar',
                        data: {
                            labels: numericCols,
                            datasets: data.slice(0, 3).map(row => ({ // Limit to first 3 rows for clarity
                                label: row[labelCol],
                                data: numericCols.map(col => row[col]),
                            })),
                        },
                         options: { responsive: true, maintainAspectRatio: false }
                    });
                    break;
                }
                
                // --- Plotly.js ---
                case 'heatmap': {
                    const z = data.map(row => numericCols.map(col => row[col]));
                    Plotly.newPlot(container, [{
                        z: z,
                        x: numericCols,
                        y: data.map(row => row[labelCol]),
                        type: 'heatmap'
                    }], { title: 'Heatmap', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } });
                    break;
                }
                case 'surface3d': {
                     const z = data.map(row => numericCols.map(col => row[col]));
                    Plotly.newPlot(container, [{
                        z: z,
                        type: 'surface'
                    }], { title: '3D Surface Plot', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' }});
                    break;
                }
                case 'sunburst':
                case 'treemap': {
                    Plotly.newPlot(container, [{
                        type: chartType,
                        labels: data.map(r => r[headers[0]]),
                        parents: data.map(r => r[headers[1]] || ""),
                        values: data.map(r => r[numericCols[0]]),
                        textinfo: "label+percent entry",
                    }], { title: chartType === 'sunburst' ? 'Sunburst Chart' : 'Treemap', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } });
                    break;
                }
                 case 'funnel': {
                    Plotly.newPlot(container, [{
                        type: 'funnel',
                        y: data.map(r => r[headers[0]]),
                        x: data.map(r => r[numericCols[0]]),
                        textposition: 'inside',
                        textinfo: 'value+percent initial',
                    }], { title: 'Funnel Chart', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } });
                    break;
                }
                case 'animated-bubble': {
                    const frameCol = headers[2]; // Assume 3rd col is for frames (e.g., year)
                    Plotly.newPlot(container, [{
                        x: data.map(r => r[numericCols[0]]),
                        y: data.map(r => r[numericCols[1]]),
                        mode: 'markers',
                        marker: {
                            size: data.map(r => r[numericCols[2]] || 10),
                            sizemode: 'diameter'
                        },
                        transforms: [{
                            type: 'groupby',
                            groups: data.map(r => r[frameCol]),
                        }]
                    }], {
                        title: 'Animated Bubble Chart',
                        xaxis: { title: numericCols[0] },
                        yaxis: { title: numericCols[1] },
                        updatemenus: [{
                            type: 'buttons',
                            showactive: false,
                            buttons: [{
                                label: 'Play',
                                method: 'animate',
                                args: [null, { frame: { duration: 500, redraw: false }, fromcurrent: true }]
                            }]
                        }],
                         paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' }
                    });
                    break;
                }

                // --- D3.js ---
                case 'force-directed': {
                    if (!headers.includes('source') || !headers.includes('target')) {
                         container.innerHTML = `<div class="text-red-400 p-4">Error: Force-Directed Graph requires 'source' and 'target' columns.</div>`;
                         return;
                    }
                    const links = data.map(d => ({...d}));
                    const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), id => ({id}));
                    const width = container.clientWidth;
                    const height = container.clientHeight;

                    const simulation = d3.forceSimulation(nodes)
                        .force("link", d3.forceLink(links).id((d: any) => d.id))
                        .force("charge", d3.forceManyBody().strength(-200))
                        .force("center", d3.forceCenter(width / 2, height / 2));

                    const svg = d3.select(container).append("svg").attr("viewBox", [0, 0, width, height]);
                    const link = svg.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6).selectAll("line").data(links).join("line").attr("stroke-width", d => Math.sqrt(d.value || 1));
                    const node = svg.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll("circle").data(nodes).join("circle").attr("r", 5).attr("fill", "#6366f1");
                    
                    node.append("title").text(d => d.id);
                    
                    simulation.on("tick", () => {
                        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
                        node.attr("cx", d => d.x).attr("cy", d => d.y);
                    });
                    break;
                }
                case 'dendrogram': {
                     const rootData = d3.stratify()
                        .id((d: any) => d.name)
                        .parentId((d: any) => d.parent)
                        (data);
                    
                    const width = container.clientWidth;
                    const treeLayout = d3.cluster().size([container.clientHeight, width - 200]);
                    treeLayout(rootData);

                    const svg = d3.select(container).append("svg")
                        .attr("width", width)
                        .attr("height", container.clientHeight);

                    const g = svg.append("g").attr("transform", "translate(100,0)");
                    g.selectAll('.link')
                        .data(rootData.links())
                        .enter().append('path')
                        .attr('class', 'link')
                        .attr("fill", "none").attr("stroke", "#555")
                        .attr('d', d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x));
                    
                    const node = g.selectAll('.node')
                        .data(rootData.descendants())
                        .enter().append('g')
                        .attr('class', 'node')
                        .attr("transform", d => `translate(${d.y},${d.x})`);
                    
                    node.append('circle').attr('r', 4).attr("fill", "#6366f1");
                    node.append('text').attr('dy', 3).attr('x', d => d.children ? -8 : 8)
                        .style('text-anchor', d => d.children ? 'end' : 'start')
                        .text(d => d.id).attr("fill", "#e2e8f0");
                    break;
                }
                
                default:
                    container.innerHTML = `<div class="text-yellow-400 p-4">Chart type "${chartType}" not implemented yet.</div>`;
            }

        } catch (error) {
            console.error("Chart rendering error:", error);
            container.innerHTML = `<div class="text-red-400 p-4">An error occurred while rendering the chart. Check console for details.</div>`;
        }


        return () => destroyChart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, chartType]);

    return (
        <div className="bg-slate-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
            <div ref={chartRef} id="chart-container" className="flex-grow w-full h-full relative min-h-[400px]"></div>
             <div className="flex-shrink-0 pt-4 flex items-center justify-end space-x-3 border-t border-slate-700 mt-4">
                 <span className="text-sm text-slate-400">Save as:</span>
                 <button onClick={() => onSave('png')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors">
                    <Icon name="download" className="w-5 h-5" />
                    <span>PNG</span>
                 </button>
                 <button onClick={() => onSave('html')} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors">
                     <Icon name="download" className="w-5 h-5" />
                     <span>HTML</span>
                 </button>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
    const [step, setStep] = useState<Step>('upload');
    const [workbook, setWorkbook] = useState<WorkBook | null>(null);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
    const [chartData, setChartData] = useState<ChartData>([]);
    const [selectedChart, setSelectedChart] = useState<ChartDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const dropzoneRef = useRef<HTMLLabelElement>(null);

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
                    const ws: WorkSheet = wb.Sheets[sheetName];
                    if (ws['!tables']) {
                        ws['!tables'].forEach((table: any) => {
                            sources.push({ name: table.name, type: 'Table' });
                        });
                    }
                });

                setDataSources(sources);
                setStep('selectData');
            } catch (err) {
                console.error(err);
                setError('Failed to parse the Excel file. Please ensure it is a valid .xlsx file.');
                setStep('upload');
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
             setError('Failed to read the file.');
             setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    
    const handleDragEvents = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700');
        } else if (e.type === 'dragleave') {
             dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);


    const selectDataSource = (source: DataSource) => {
        if (!workbook) return;
        setIsLoading(true);
        try {
            let data: any[] = [];
            if (source.type === 'Sheet') {
                const ws = workbook.Sheets[source.name];
                data = XLSX.utils.sheet_to_json(ws);
            } else if (source.type === 'Table') {
                 for (const sheetName of workbook.SheetNames) {
                    const ws: WorkSheet = workbook.Sheets[sheetName];
                    const table = ws['!tables']?.find((t: any) => t.name === source.name);
                    if (table) {
                        const range = XLSX.utils.decode_range(table.ref);
                        // sheet_to_json doesn't directly support table ranges well, so we extract manually
                        const sheetData = XLSX.utils.sheet_to_json(ws, { range: table.ref, header: 1 });
                        if (sheetData.length > 0) {
                            const headers: string[] = sheetData[0];
                            data = sheetData.slice(1).map((row: any[]) => {
                                const rowObj: { [key: string]: any } = {};
                                headers.forEach((header, index) => {
                                    rowObj[header] = row[index];
                                });
                                return rowObj;
                            });
                        }
                        break;
                    }
                }
            }

            if (data.length > 0) {
                setChartData(data);
                setSelectedDataSource(source);
                setStep('selectChart');
            } else {
                setError(`Data source "${source.name}" is empty or could not be read.`);
            }
        } catch (err) {
             console.error(err);
             setError('Failed to extract data from the selected source.');
        } finally {
             setIsLoading(false);
        }
    };

    const selectChart = (chart: ChartDefinition) => {
        setSelectedChart(chart);
        setStep('visualize');
    };

    const reset = () => {
        setStep('upload');
        setWorkbook(null);
        setDataSources([]);
        setSelectedDataSource(null);
        setChartData([]);
        setSelectedChart(null);
        setError(null);
        setFileName('');
    };

    const handleSave = useCallback((format: 'png' | 'html') => {
        const chartContainer = document.getElementById('chart-container');
        if (!chartContainer || !selectedChart) return;
        
        const download = (href: string, filename: string) => {
             const a = document.createElement('a');
             a.href = href;
             a.download = filename;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
        };
        
        const filename = `${selectedDataSource?.name}_${selectedChart.id}.${format}`;

        if (format === 'png') {
            if(selectedChart.library === 'Plotly.js') {
                Plotly.downloadImage(chartContainer, { format: 'png', width: 1200, height: 800, filename });
            } else {
                 const canvas = chartContainer.querySelector('canvas');
                 const svg = chartContainer.querySelector('svg');
                 if (canvas) {
                    download(canvas.toDataURL('image/png'), filename);
                 } else if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const img = new Image();
                    const canvas = document.createElement('canvas');
                    canvas.width = svg.clientWidth;
                    canvas.height = svg.clientHeight;
                    const ctx = canvas.getContext('2d');
                    img.onload = () => {
                        ctx?.drawImage(img, 0, 0);
                        download(canvas.toDataURL('image/png'), filename);
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                 }
            }
        } else if (format === 'html') {
             if (selectedChart.library === 'Plotly.js') {
                const { data, layout } = (chartContainer as any)._fullData;
                const html = `
                <html>
                    <head><title>${selectedChart.name}</title><script src="https://cdn.plot.ly/plotly-2.32.0.min.js"><\/script></head>
                    <body>
                        <div id="plot"></div>
                        <script>
                            Plotly.newPlot('plot', ${JSON.stringify(data)}, ${JSON.stringify(layout)});
                        <\/script>
                    </body>
                </html>`;
                const blob = new Blob([html], { type: 'text/html' });
                download(URL.createObjectURL(blob), filename);
             } else {
                alert('HTML export is currently only supported for Plotly.js charts.');
             }
        }
    }, [selectedChart, selectedDataSource]);
    
    const renderStep = () => {
        if(isLoading) return <Spinner />;

        switch (step) {
            case 'upload':
                return (
                     <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Upload Your Excel File</h2>
                        <p className="text-slate-400 mb-8">Drag & drop or click to select a .xlsx file to begin.</p>
                        <label 
                            ref={dropzoneRef}
                            onDragEnter={handleDragEvents}
                            onDragOver={handleDragEvents}
                            onDragLeave={handleDragEvents}
                            onDrop={handleDrop}
                            htmlFor="file-upload" 
                            className="relative block w-full max-w-lg mx-auto p-12 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center space-y-4">
                               <Icon name="upload" className="w-12 h-12 text-slate-500" />
                               <span className="font-semibold text-slate-300">Drop file here or click to upload</span>
                               <span className="text-sm text-slate-500">Supports .xlsx files</span>
                            </div>
                           <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx" onChange={handleFileChange} />
                        </label>
                     </div>
                );
            case 'selectData':
                return (
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">Select Data Source</h2>
                        <p className="text-slate-400 mb-8">Choose a sheet or table from <span className="font-semibold text-cyan-400">{fileName}</span> to visualize.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dataSources.map(source => (
                                <button key={`${source.type}-${source.name}`} onClick={() => selectDataSource(source)} className="p-4 bg-slate-800 rounded-lg text-left hover:bg-slate-700 hover:ring-2 hover:ring-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <div className="flex items-center space-x-3">
                                        <Icon name={source.type === 'Sheet' ? 'sheet' : 'table'} className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-white">{source.name}</p>
                                            <p className="text-sm text-slate-400">{source.type}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'selectChart':
                return (
                     <div>
                        <h2 className="text-3xl font-bold text-white mb-4">Choose a Visualization</h2>
                        <p className="text-slate-400 mb-8">Data from <span className="font-semibold text-cyan-400">{selectedDataSource?.name}</span> is ready. Select a chart type.</p>
                        {['Standard', 'Advanced', 'Animated'].map(category => (
                            <div key={category}>
                                <h3 className="text-xl font-semibold text-slate-300 mt-6 mb-3 border-b border-slate-700 pb-2">{category} Charts</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {CHART_DEFINITIONS.filter(c => c.category === category).map(chart => (
                                        <button key={chart.id} onClick={() => selectChart(chart)} className="p-4 bg-slate-800 rounded-lg text-left hover:bg-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all flex flex-col h-full">
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
            case 'visualize':
                return selectedChart && (
                    <div className="h-full flex flex-col">
                        <h2 className="text-3xl font-bold text-white mb-4">{selectedChart.name}</h2>
                        <p className="text-slate-400 mb-4">Visualizing data from <span className="font-semibold text-cyan-400">{selectedDataSource?.name}</span>.</p>
                        <div className="flex-grow min-h-0">
                             <ChartRenderer data={chartData} chartType={selectedChart.id} onSave={handleSave} />
                        </div>
                    </div>
                );
        }
    };
    
    const steps = ['upload', 'selectData', 'selectChart', 'visualize'];
    const currentStepIndex = steps.indexOf(step);

    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                         <h1 className="text-2xl sm:text-4xl font-bold text-white">
                           Excel Data <span className="text-cyan-400">Visualizer</span>
                         </h1>
                         <p className="text-slate-400 mt-1">Instantly create powerful charts from your spreadsheets.</p>
                    </div>
                   {step !== 'upload' && (
                        <button onClick={reset} className="mt-4 sm:mt-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-semibold flex items-center space-x-2 transition-colors">
                            <span>Start Over</span>
                        </button>
                   )}
                </header>
                
                 {/* Progress Bar */}
                <div className="w-full mb-8">
                    <div className="flex">
                        {steps.map((s, i) => (
                            <div key={s} className="flex-1">
                                <div className={`h-1 transition-colors ${currentStepIndex >= i ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                                <p className={`mt-2 text-xs text-center capitalize ${currentStepIndex >= i ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>{s.replace('selectData', 'Select Data').replace('selectChart', 'Select Chart')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <main className={`p-6 bg-slate-800/50 rounded-lg shadow-2xl min-h-[50vh] flex flex-col justify-center ${step === 'visualize' ? 'h-[70vh]' : ''}`}>
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-md mb-6">
                           <strong>Error:</strong> {error}
                        </div>
                    )}
                    {renderStep()}
                </main>
                 <footer className="text-center mt-8 text-slate-500 text-sm">
                    <p>Powered by React, Tailwind CSS, SheetJS, Chart.js, Plotly.js, and D3.js.</p>
                </footer>
            </div>
        </div>
    );
}