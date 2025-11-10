import React, { useEffect, useCallback } from 'react';
import { SavedVisualization } from '../lib/types';
import Icon from './Icon';

declare var Chart: any;
declare var Plotly: any;
declare var d3: any;

interface ChartRendererProps {
    viz: SavedVisualization;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ viz }) => {
    const { id: vizId, chartData, chartDefinition, columnMapping } = viz;
    const containerId = `chart-container-${vizId}`;

    const handleSave = useCallback((format: 'png' | 'html') => {
        const chartContainer = document.getElementById(containerId);
        if (!chartContainer || !chartDefinition) return;

        const filename = `${viz.dataSourceName}_${chartDefinition.id}.${format}`;
        const download = (href: string, filename: string) => {
            const a = document.createElement('a');
            a.href = href;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        if (format === 'png') {
            if (chartDefinition.library === 'Plotly.js') {
                Plotly.downloadImage(chartContainer, { format: 'png', width: 1200, height: 800, filename });
            } else {
                const canvas = chartContainer.querySelector('canvas');
                const svg = chartContainer.querySelector('svg');
                if (canvas) {
                    download(canvas.toDataURL('image/png'), filename);
                } else if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const img = new Image();
                    const canvasEl = document.createElement('canvas');
                    canvasEl.width = svg.clientWidth;
                    canvasEl.height = svg.clientHeight;
                    const ctx = canvasEl.getContext('2d');
                    img.onload = () => {
                        ctx?.drawImage(img, 0, 0);
                        download(canvasEl.toDataURL('image/png'), filename);
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                }
            }
        } else if (format === 'html') {
            if (chartDefinition.library === 'Plotly.js') {
                const { data, layout } = (chartContainer as any)._fullData;
                const html = `<html><head><title>${chartDefinition.name}</title><script src="https://cdn.plot.ly/plotly-2.32.0.min.js"><\/script></head><body><div id="plot"></div><script>Plotly.newPlot('plot', ${JSON.stringify(data)}, ${JSON.stringify(layout)});<\/script></body></html>`;
                const blob = new Blob([html], { type: 'text/html' });
                download(URL.createObjectURL(blob), filename);
            } else {
                alert('HTML export is currently only supported for Plotly.js charts.');
            }
        }
    }, [containerId, chartDefinition, viz.dataSourceName]);

    useEffect(() => {
        const chartRef = document.getElementById(containerId);
        if (!chartRef || !chartData || chartData.length === 0 || !columnMapping) return;

        let chartInstance: any = null;
        const container = chartRef;
        const chartType = chartDefinition.id;

        const destroyChart = () => {
            if (chartInstance && chartInstance.destroy) {
                chartInstance.destroy();
            } else if (chartDefinition.library === 'Plotly.js') {
                Plotly.purge(container);
            }
            container.innerHTML = '';
        };

        destroyChart();

        const get = (key: string) => columnMapping[key];
        const has = (key: string) => !!columnMapping[key];

        try {
            switch (chartType) {
                case 'bar': case 'line': {
                    if (!has('category') || !has('values')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    const valueCols = get('values').split(',');
                    chartInstance = new Chart(ctx, { type: chartType, data: { labels: chartData.map(row => row[get('category')]), datasets: valueCols.map(col => ({ label: col, data: chartData.map(row => row[col]), tension: chartType === 'line' ? 0.1 : undefined })) }, options: { responsive: true, maintainAspectRatio: false } });
                    break;
                }
                case 'pie': {
                    if (!has('labels') || !has('values')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    chartInstance = new Chart(ctx, { type: 'pie', data: { labels: chartData.map(row => row[get('labels')]), datasets: [{ label: get('values'), data: chartData.map(row => row[get('values')]) }] }, options: { responsive: true, maintainAspectRatio: false } });
                    break;
                }
                case 'scatter': {
                    if (!has('x') || !has('y')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    chartInstance = new Chart(ctx, { type: 'scatter', data: { datasets: [{ label: `${get('x')} vs ${get('y')}`, data: chartData.map(row => ({ x: row[get('x')], y: row[get('y')] })) }] }, options: { responsive: true, maintainAspectRatio: false } });
                    break;
                }
                case 'radar': {
                    if (!has('category') || !has('values')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    const valueCols = get('values').split(',');
                    chartInstance = new Chart(ctx, { type: 'radar', data: { labels: valueCols, datasets: chartData.slice(0, 5).map(row => ({ label: row[get('category')], data: valueCols.map(col => row[col]) })) }, options: { responsive: true, maintainAspectRatio: false } });
                    break;
                }
                case 'heatmap': { 
                    if (!has('x') || !has('y') || !has('z')) return;
                    const xVals = Array.from(new Set(chartData.map(r => r[get('x')]))).sort();
                    const yVals = Array.from(new Set(chartData.map(r => r[get('y')]))).sort();
                    const zVals = yVals.map(y => xVals.map(x => chartData.find(r => r[get('x')] === x && r[get('y')] === y)?.[get('z')] || null));
                    Plotly.newPlot(container, [{ z: zVals, x: xVals, y: yVals, type: 'heatmap' }], { title: 'Heatmap', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } }); break; 
                }
                case 'surface3d': { 
                    // Assumes grid data for simplicity. Could be improved with more complex data shaping.
                    if (!has('x') || !has('y') || !has('z')) return;
                    const zData = [];
                    const uniqueY = [...new Set(chartData.map(item => item[get('y')]))];
                    for(const y of uniqueY){
                        zData.push(chartData.filter(item => item[get('y')] === y).map(item => item[get('z')]));
                    }
                    Plotly.newPlot(container, [{ z: zData, x: [...new Set(chartData.map(item => item[get('x')]))], y: uniqueY, type: 'surface' }], { title: '3D Surface Plot', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } }); break; 
                }
                case 'sunburst': case 'treemap': { 
                    if (!has('labels') || !has('parents') || !has('values')) return;
                    Plotly.newPlot(container, [{ type: chartType, labels: chartData.map(r => r[get('labels')]), parents: chartData.map(r => r[get('parents')]), values: chartData.map(r => r[get('values')]), textinfo: "label+percent entry", }], { title: chartType === 'sunburst' ? 'Sunburst Chart' : 'Treemap', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } }); break; 
                }
                case 'funnel': { 
                    if (!has('stage') || !has('value')) return;
                    Plotly.newPlot(container, [{ type: 'funnel', y: chartData.map(r => r[get('stage')]), x: chartData.map(r => r[get('value')]), textposition: 'inside', textinfo: 'value+percent initial' }], { title: 'Funnel Chart', paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } }); break; 
                }
                case 'marimekko': {
                    if (!has('x') || !has('y') || !has('segment')) return;
                    const xCol = get('x');
                    const yCol = get('y');
                    const segmentCol = get('segment');

                    const groupTotals: { [key: string]: number } = {};
                    chartData.forEach(row => {
                        groupTotals[row[xCol]] = (groupTotals[row[xCol]] || 0) + parseFloat(row[yCol]);
                    });
                    
                    const xCategories = Object.keys(groupTotals);
                    const widths = xCategories.map(cat => groupTotals[cat]);
                    const uniqueSegments = [...new Set(chartData.map(row => row[segmentCol]))].sort();

                    const traces = uniqueSegments.map(segment => {
                        const yValues = xCategories.map(cat => {
                            const row = chartData.find(r => r[xCol] === cat && r[segmentCol] === segment);
                            return row ? parseFloat(row[yCol]) : 0;
                        });
                        return { x: xCategories, y: yValues, width: widths, name: segment, type: 'bar' };
                    });

                    Plotly.newPlot(container, traces, {
                        title: 'Marimekko Chart',
                        barmode: 'stack',
                        xaxis: { title: xCol },
                        yaxis: { title: yCol },
                        paper_bgcolor: '#1e293b',
                        plot_bgcolor: '#1e293b',
                        font: { color: '#e2e8f0' }
                    });
                    break;
                }
                case 'animated-bubble': {
                    if (!has('x') || !has('y') || !has('size') || !has('frame')) return;
                    Plotly.newPlot(container, [{ x: chartData.map(r => r[get('x')]), y: chartData.map(r => r[get('y')]), mode: 'markers', marker: { size: chartData.map(r => r[get('size')] || 10), sizemode: 'diameter' }, transforms: [{ type: 'groupby', groups: chartData.map(r => r[get('frame')]) }] }], { title: 'Animated Bubble Chart', xaxis: { title: get('x') }, yaxis: { title: get('y') }, updatemenus: [{ type: 'buttons', showactive: false, buttons: [{ label: 'Play', method: 'animate', args: [null, { frame: { duration: 500, redraw: false }, fromcurrent: true }] }] }], paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' } });
                    break;
                }
                 case 'bar-chart-race': {
                    if (!has('label') || !has('value') || !has('frame')) return;
                    const labelCol = get('label'), valueCol = get('value'), frameCol = get('frame');
                    const frames = [...new Set(chartData.map(d => d[frameCol]))].sort();
                    const maxValue = Math.max(...chartData.map(d => parseFloat(d[valueCol])));

                    const plotFrames = frames.map(frame => {
                        const frameData = chartData
                            .filter(d => d[frameCol] === frame)
                            .sort((a, b) => parseFloat(a[valueCol]) - parseFloat(b[valueCol]))
                            .slice(-15); // Top 15

                        return {
                            name: frame,
                            data: [{
                                x: frameData.map(d => d[valueCol]),
                                y: frameData.map(d => d[labelCol]),
                                type: 'bar',
                                orientation: 'h',
                                text: frameData.map(d => d[valueCol]),
                                texttemplate: '%{x:,.0f}',
                                textposition: 'inside',
                            }]
                        };
                    });
                    
                    Plotly.newPlot(container, {
                        data: plotFrames[0].data,
                        layout: {
                            title: 'Bar Chart Race',
                            xaxis: { range: [0, maxValue * 1.1], autorange: false },
                            yaxis: { autorange: true },
                            updatemenus: [{
                                x: 0.1, y: 0, pad: { t: 50 },
                                showactive: false, direction: 'left', type: 'buttons',
                                buttons: [{
                                    label: 'Play', method: 'animate',
                                    args: [null, { frame: { duration: 200, redraw: true }, fromcurrent: true, transition: { duration: 100, easing: 'linear' } }]
                                }, {
                                    label: 'Pause', method: 'animate',
                                    args: [[null], { mode: 'immediate' }]
                                }]
                            }],
                            sliders: [{
                                pad: { l: 130, t: 30 }, currentvalue: { visible: true, prefix: 'Frame: ', xanchor: 'right' },
                                steps: plotFrames.map(f => ({
                                    label: f.name.toString(), method: 'animate',
                                    args: [[f.name], { mode: 'immediate', frame: { duration: 200, redraw: true }, transition: { duration: 100 } }]
                                }))
                            }],
                            paper_bgcolor: '#1e293b', plot_bgcolor: '#1e293b', font: { color: '#e2e8f0' }
                        },
                        frames: plotFrames,
                    });
                    break;
                }
                case 'force-directed': {
                    if (!has('source') || !has('target')) return;
                    const links = chartData.map(d => ({ source: d[get('source')], target: d[get('target')], value: has('value') ? d[get('value')] : 1 })); 
                    const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), id => ({id})); const width = container.clientWidth; const height = container.clientHeight; const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id((d: any) => d.id)).force("charge", d3.forceManyBody().strength(-200)).force("center", d3.forceCenter(width / 2, height / 2)); const svg = d3.select(container).append("svg").attr("viewBox", [0, 0, width, height]); const link = svg.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6).selectAll("line").data(links).join("line").attr("stroke-width", (d: any) => Math.sqrt(d.value || 1)); const node = svg.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll("circle").data(nodes).join("circle").attr("r", 5).attr("fill", "#6366f1"); node.append("title").text((d: any) => d.id); simulation.on("tick", () => { link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y); node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y); });
                    break;
                }
                case 'dendrogram': {
                    if (!has('id') || !has('parent')) return;
                    const rootData = d3.stratify().id((d: any) => d[get('id')]).parentId((d: any) => d[get('parent')])(chartData); const width = container.clientWidth; const treeLayout = d3.cluster().size([container.clientHeight, width - 200]); treeLayout(rootData); const svg = d3.select(container).append("svg").attr("width", width).attr("height", container.clientHeight); const g = svg.append("g").attr("transform", "translate(100,0)"); g.selectAll('.link').data(rootData.links()).enter().append('path').attr('class', 'link').attr("fill", "none").attr("stroke", "#555").attr('d', d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x) as any); const node = g.selectAll('.node').data(rootData.descendants()).enter().append('g').attr('class', 'node').attr("transform", d => `translate(${d.y},${d.x})`); node.append('circle').attr('r', 4).attr("fill", "#6366f1"); node.append('text').attr('dy', 3).attr('x', d => d.children ? -8 : 8).style('text-anchor', d => d.children ? 'end' : 'start').text((d: any) => d.id).attr("fill", "#e2e8f0");
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
    }, [containerId, chartData, chartDefinition, columnMapping]);

    return (
        <div className="bg-slate-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
            <div id={containerId} className="flex-grow w-full relative min-h-[400px]"></div>
            <div className="flex-shrink-0 pt-4 flex items-center justify-end space-x-3 border-t border-slate-700 mt-4">
                <span className="text-sm text-slate-400">Save as:</span>
                <button onClick={() => handleSave('png')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold flex items-center space-x-2">
                    <Icon name="download" className="w-5 h-5"/><span>PNG</span>
                </button>
                <button onClick={() => handleSave('html')} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold flex items-center space-x-2">
                    <Icon name="download" className="w-5 h-5"/><span>HTML</span>
                </button>
            </div>
        </div>
    );
};

export default ChartRenderer;