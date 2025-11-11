// FIX: Import `useMemo` from React.
import React, { useEffect, useCallback, useMemo } from 'react';
import { SavedVisualization, ChartOptions } from '../lib/types';
import { getColumnTypes, formatValue } from '../lib/utils';
import { COLOR_PALETTES } from '../lib/constants';
import Icon from './Icon';

declare var Chart: any;
declare var Plotly: any;
declare var d3: any;

interface ChartRendererProps {
    viz: SavedVisualization;
}

const defaultChartOptions: ChartOptions = {
    title: { display: true, text: '' },
    xAxis: { display: true, title: '' },
    yAxis: { display: true, title: '' },
    legend: { display: true, position: 'top' },
    colorPalette: 'Default',
};

const ChartRenderer: React.FC<ChartRendererProps> = ({ viz }) => {
    const { id: vizId, chartData, chartDefinition, columnMapping, formatOptions = {}, chartOptions: userChartOptions } = viz;
    const containerId = `chart-container-${vizId}`;

    const chartOptions = useMemo(() => ({
        ...defaultChartOptions,
        ...userChartOptions,
        title: { ...defaultChartOptions.title, ...userChartOptions?.title },
        xAxis: { ...defaultChartOptions.xAxis, ...userChartOptions?.xAxis },
        yAxis: { ...defaultChartOptions.yAxis, ...userChartOptions?.yAxis },
        legend: { ...defaultChartOptions.legend, ...userChartOptions?.legend },
    }), [userChartOptions]);

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
            // Custom cleanup for Marimekko legends
            document.getElementById(`mekko-seg-legend-${vizId}`)?.remove();
            document.getElementById(`mekko-bar-legend-${vizId}`)?.remove();
        };

        destroyChart();

        const get = (key: string) => columnMapping[key];
        const has = (key: string) => !!columnMapping[key];
        const columnTypes = getColumnTypes(chartData);

        const palette = COLOR_PALETTES.find(p => p.name === chartOptions.colorPalette)?.colors || COLOR_PALETTES[0].colors;

        const chartjsOptions: any = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: chartOptions.title.display && !!chartOptions.title.text, text: chartOptions.title.text, color: '#e2e8f0', font: { size: 18 } },
                legend: { display: chartOptions.legend.display, position: chartOptions.legend.position, labels: { color: '#e2e8f0' } }
            },
            scales: {
                x: { display: chartOptions.xAxis.display, title: { display: !!chartOptions.xAxis.title, text: chartOptions.xAxis.title, color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { display: chartOptions.yAxis.display, title: { display: !!chartOptions.yAxis.title, text: chartOptions.yAxis.title, color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        };
        
        const legendPositionMapping: { [key: string]: any } = {
            top: { y: 1.1, x: 0.5, yanchor: 'bottom', xanchor: 'center', orientation: 'h' },
            bottom: { y: -0.2, x: 0.5, yanchor: 'top', xanchor: 'center', orientation: 'h' },
            left: { y: 0.5, x: -0.1, yanchor: 'middle', xanchor: 'right' },
            right: { y: 0.5, x: 1.1, yanchor: 'middle', xanchor: 'left' }
        };

        const plotlyLayout: any = {
            title: chartOptions.title.display ? { text: chartOptions.title.text, x: 0.5, y: 0.95 } : undefined,
            paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: '#e2e8f0' }, colorway: palette,
            xaxis: { visible: chartOptions.xAxis.display, title: chartOptions.xAxis.title || undefined, gridcolor: '#334155' },
            yaxis: { visible: chartOptions.yAxis.display, title: chartOptions.yAxis.title || undefined, gridcolor: '#334155' },
            showlegend: chartOptions.legend.display,
            legend: legendPositionMapping[chartOptions.legend.position]
        };

        try {
            switch (chartType) {
                case 'bar': case 'line': {
                    if (!has('category') || !has('values')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    const valueCols = get('values').split(',');
                    chartInstance = new Chart(ctx, { type: chartType, data: { labels: chartData.map(row => row[get('category')]), datasets: valueCols.map((col, i) => ({ label: col, data: chartData.map(row => row[col]), tension: chartType === 'line' ? 0.1 : undefined, backgroundColor: palette[i % palette.length], borderColor: palette[i % palette.length] })) }, options: chartjsOptions });
                    break;
                }
                case 'pie': {
                    if (!has('labels') || !has('values')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    chartInstance = new Chart(ctx, { type: 'pie', data: { labels: chartData.map(row => row[get('labels')]), datasets: [{ label: get('values'), data: chartData.map(row => row[get('values')]), backgroundColor: palette }] }, options: chartjsOptions });
                    break;
                }
                case 'scatter': {
                    if (!has('x') || !has('y')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    chartInstance = new Chart(ctx, { type: 'scatter', data: { datasets: [{ label: `${get('x')} vs ${get('y')}`, data: chartData.map(row => ({ x: row[get('x')], y: row[get('y')] })), backgroundColor: palette[0], borderColor: palette[0] }] }, options: chartjsOptions });
                    break;
                }
                case 'radar': {
                    if (!has('category') || !has('values')) return;
                    const canvas = document.createElement('canvas'); container.appendChild(canvas); const ctx = canvas.getContext('2d'); if (!ctx) return;
                    const valueCols = get('values').split(',');
                    chartInstance = new Chart(ctx, { type: 'radar', data: { labels: valueCols, datasets: chartData.slice(0, 5).map((row, i) => ({ label: row[get('category')], data: valueCols.map(col => row[col]), backgroundColor: `${palette[i % palette.length]}80`, borderColor: palette[i % palette.length] })) }, options: chartjsOptions });
                    break;
                }
                case 'heatmap': { 
                    if (!has('x') || !has('y') || !has('z')) return;
                    const xVals = Array.from(new Set(chartData.map(r => r[get('x')]))).sort();
                    const yVals = Array.from(new Set(chartData.map(r => r[get('y')]))).sort();
                    const zVals = yVals.map(y => xVals.map(x => chartData.find(r => r[get('x')] === x && r[get('y')] === y)?.[get('z')] || null));
                    Plotly.newPlot(container, [{ z: zVals, x: xVals, y: yVals, type: 'heatmap' }], { ...plotlyLayout, title: plotlyLayout.title || { text: 'Heatmap', x: 0.5, y: 0.95 } }); break; 
                }
                case 'surface3d': { 
                    if (!has('x') || !has('y') || !has('z')) return;
                    const zData = [];
                    const uniqueY = [...new Set(chartData.map(item => item[get('y')]))];
                    for(const y of uniqueY){
                        zData.push(chartData.filter(item => item[get('y')] === y).map(item => item[get('z')]));
                    }
                    Plotly.newPlot(container, [{ z: zData, x: [...new Set(chartData.map(item => item[get('x')]))], y: uniqueY, type: 'surface' }], { ...plotlyLayout, title: plotlyLayout.title || { text: '3D Surface Plot', x: 0.5, y: 0.95 } }); break; 
                }
                case 'sunburst': case 'treemap': { 
                    if (!has('labels') || !has('parents') || !has('values')) return;
                    Plotly.newPlot(container, [{ type: chartType, labels: chartData.map(r => r[get('labels')]), parents: chartData.map(r => r[get('parents')]), values: chartData.map(r => r[get('values')]), textinfo: "label+percent entry", marker: { colors: palette } }], { ...plotlyLayout, title: plotlyLayout.title || { text: chartType === 'sunburst' ? 'Sunburst Chart' : 'Treemap', x: 0.5, y: 0.95 } }); break; 
                }
                case 'funnel': { 
                    if (!has('stage') || !has('value')) return;
                    Plotly.newPlot(container, [{ type: 'funnel', y: chartData.map(r => r[get('stage')]), x: chartData.map(r => r[get('value')]), textposition: 'inside', textinfo: 'value+percent initial', marker: { color: palette[0] } }], { ...plotlyLayout, title: plotlyLayout.title || { text: 'Funnel Chart', x: 0.5, y: 0.95 } }); break; 
                }
                case 'marimekko': {
                    if (!has('barCategory') || !has('segmentCategory') || !has('value')) return;

                    const barCol = get('barCategory'), segCol = get('segmentCategory'), valCol = get('value');

                    // 1. Pivot and aggregate data
                    const pivot: { [bar: string]: { [seg: string]: number } } = chartData.reduce((acc, row) => {
                        const bar = row[barCol]; const seg = row[segCol]; const val = parseFloat(row[valCol]);
                        if (isNaN(val) || !bar || !seg) return acc;
                        acc[bar] = acc[bar] || {};
                        acc[bar][seg] = (acc[bar][seg] || 0) + val;
                        return acc;
                    }, {});
                    
                    // 2. Calculate totals and sort bars by total
                    const barTotals = Object.entries(pivot).map(([bar, segs]) => ({
                        bar, segs, total: Object.values(segs).reduce((s, v) => s + v, 0)
                    })).sort((a, b) => b.total - a.total);

                    const grandTotal = barTotals.reduce((s, b) => s + b.total, 0);
                    if (grandTotal === 0) break;

                    // 3. Calculate segment totals and sort them
                    const segmentTotals = chartData.reduce((acc, row) => {
                        const seg = row[segCol]; const val = parseFloat(row[valCol]);
                        if (!isNaN(val) && seg) acc[seg] = (acc[seg] || 0) + val;
                        return acc;
                    }, {} as { [key: string]: number });

                    const sortedSegments = Object.keys(segmentTotals).sort((a, b) => segmentTotals[b] - segmentTotals[a]);

                    // 4. Prepare Plotly shapes and annotations
                    const shapes: any[] = []; const annotations: any[] = []; let currentX = 0;
                    const segmentPalette = palette;
                    const barPalette = COLOR_PALETTES.find(p => p.name === 'Tab20')?.colors || palette;
                    const segColorMap = sortedSegments.reduce((map, seg, i) => ({ ...map, [seg]: segmentPalette[i % segmentPalette.length] }), {});

                    barTotals.forEach(({ bar, segs, total }, barIndex) => {
                        const width = total / grandTotal; let currentY = 0;
                        sortedSegments.forEach(seg => {
                            if (!segs[seg]) return;
                            const height = segs[seg] / total;
                            shapes.push({ type: 'rect', x0: currentX, x1: currentX + width, y0: currentY, y1: currentY + height, fillcolor: segColorMap[seg], line: { width: 0.5, color: 'white' } });
                            if (height > 0.05) { // Add label if segment is large enough
                                annotations.push({ x: currentX + width / 2, y: currentY + height / 2, text: `${formatValue(segs[seg], formatOptions[valCol], 'numeric')}<br>(${(height * 100).toFixed(1)}%)`, showarrow: false, font: { color: 'black', size: 9 } });
                            }
                            currentY += height;
                        });
                        // Add numbered reference
                        annotations.push({ x: currentX + width / 2, y: -0.04, text: `<b>${barIndex + 1}</b>`, showarrow: false, font: { color: 'white', size: 10 }, bgcolor: barPalette[barIndex % barPalette.length], borderpad: 2, bordercolor: 'grey', yanchor: 'top' });
                        currentX += width;
                    });
                    
                    // 5. Create and append custom HTML legends
                    const createLegend = (id: string, title: string, items: { color: string; label: string }[]) => {
                        const container = document.createElement('div');
                        container.id = id; container.className = 'w-full text-center mt-2 text-slate-300 text-xs px-4';
                        let html = `<div class="font-bold mb-2">${title}</div><div class="flex flex-wrap justify-center gap-x-6 gap-y-1">`;
                        items.forEach(item => { html += `<div class="flex items-center"><span class="w-3 h-3 rounded-sm mr-2" style="background-color: ${item.color}"></span><span>${item.label}</span></div>`; });
                        html += `</div>`;
                        container.innerHTML = html;
                        return container;
                    };
                    
                    const parent = container.parentElement;
                    if(parent){
                        const segLegendItems = sortedSegments.map(seg => ({ color: segColorMap[seg], label: `${seg} (${formatValue(segmentTotals[seg], formatOptions[valCol], 'numeric')})` }));
                        const barLegendItems = barTotals.map(({ bar, total }, i) => ({ color: barPalette[i % barPalette.length], label: `${i + 1}. ${bar} (${formatValue(total, formatOptions[valCol], 'numeric')})` }));
                        
                        const segLegend = createLegend(`mekko-seg-legend-${vizId}`, "Revenue Types", segLegendItems);
                        const barLegend = createLegend(`mekko-bar-legend-${vizId}`, "Business Units", barLegendItems);
                        
                        // Insert chart title if it exists
                        if (plotlyLayout.title?.text) {
                            const titleEl = document.createElement('h3');
                            titleEl.textContent = plotlyLayout.title.text;
                            titleEl.className = 'text-lg font-bold text-center text-slate-200 mb-2';
                            container.appendChild(titleEl);
                        }
                        
                        Plotly.newPlot(container, [], { paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', xaxis: { visible: false, range: [0, 1] }, yaxis: { visible: false, range: [0, 1.05] }, shapes, annotations, showlegend: false, margin: { t: 0, b: 50, l: 10, r: 10 } });
                        
                        parent.appendChild(segLegend);
                        parent.appendChild(barLegend);
                    }
                    break;
                }
                case 'animated-bubble': {
                    if (!has('x') || !has('y') || !has('size') || !has('frame')) return;
                    Plotly.newPlot(container, [{ x: chartData.map(r => r[get('x')]), y: chartData.map(r => r[get('y')]), mode: 'markers', marker: { size: chartData.map(r => r[get('size')] || 10), sizemode: 'diameter', color: chartData.map(r => r[get('frame')]) }, transforms: [{ type: 'groupby', groups: chartData.map(r => r[get('frame')]) }] }], { ...plotlyLayout, title: plotlyLayout.title || { text: 'Animated Bubble Chart', x: 0.5, y: 0.95 }, updatemenus: [{ type: 'buttons', showactive: false, buttons: [{ label: 'Play', method: 'animate', args: [null, { frame: { duration: 500, redraw: false }, fromcurrent: true }] }] }] });
                    break;
                }
                 case 'bar-chart-race': {
                    if (!has('label') || !has('value') || !has('frame')) return;
                    const labelCol = get('label'), valueCol = get('value'), frameCol = get('frame');
                    const frames = [...new Set(chartData.map(d => d[frameCol]))].sort((a,b) => a-b);
                    const maxValue = Math.max(...chartData.map(d => parseFloat(d[valueCol])));
                    const valueFormatOpts = formatOptions[valueCol];
                    const frameFormatOpts = formatOptions[frameCol];
                    const frameColType = columnTypes[frameCol];
                    
                    const valueTickFormat = (val: number) => formatValue(val, valueFormatOpts, 'numeric');

                    const plotFrames = frames.map(frame => {
                        const frameData = chartData.filter(d => d[frameCol] === frame).sort((a, b) => parseFloat(b[valueCol]) - parseFloat(a[valueCol])).slice(0, 15).reverse();
                        return { name: frame, data: [{ x: frameData.map(d => d[valueCol]), y: frameData.map(d => d[labelCol]), type: 'bar', orientation: 'h', text: frameData.map(d => valueTickFormat(d[valueCol])), textposition: 'auto', insidetextanchor: 'end', hoverinfo: 'y+text', marker: { color: palette[0] } }] };
                    });
                    
                    Plotly.newPlot(container, {
                        data: plotFrames[0].data,
                        layout: {
                            ...plotlyLayout,
                            title: plotlyLayout.title || { text: 'Bar Chart Race', x: 0.5, y: 0.95 },
                            xaxis: { ...plotlyLayout.xaxis, range: [0, maxValue * 1.1], autorange: false, tickformat: valueFormatOpts?.notation === 'compact' ? '.2s' : undefined },
                            yaxis: { ...plotlyLayout.yaxis, autorange: 'reversed', tickfont: {size: 10} },
                            margin: { l: 150, t: 80, b: 80 },
                            updatemenus: [{ x: 0.1, y: 0, pad: { t: 50 }, showactive: false, direction: 'left', type: 'buttons', buttons: [{ label: 'Play', method: 'animate', args: [null, { frame: { duration: 100, redraw: true }, fromcurrent: true, transition: { duration: 50, easing: 'linear' } }] }, { label: 'Pause', method: 'animate', args: [[null], { mode: 'immediate' }] }] }],
                            sliders: [{ pad: { l: 130, t: 30 }, currentvalue: { visible: true, prefix: 'Frame: ', xanchor: 'right' }, steps: plotFrames.map(f => ({ label: formatValue(f.name, frameFormatOpts, frameColType), method: 'animate', args: [[f.name], { mode: 'immediate', frame: { duration: 100, redraw: true }, transition: { duration: 50 } }] })) }]
                        },
                        frames: plotFrames,
                    });
                    break;
                }
                case 'force-directed': {
                    if (!has('source') || !has('target')) return;
                    if (chartOptions.title.display && chartOptions.title.text) { const titleEl = document.createElement('h3'); titleEl.textContent = chartOptions.title.text; titleEl.className = 'text-lg font-bold text-center text-slate-200 mb-2'; container.appendChild(titleEl); }
                    const links = chartData.map(d => ({ source: d[get('source')], target: d[get('target')], value: has('value') ? d[get('value')] : 1 })); 
                    const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), id => ({id})); const width = container.clientWidth; const height = chartOptions.title.display && chartOptions.title.text ? container.clientHeight - 30 : container.clientHeight; const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id((d: any) => d.id)).force("charge", d3.forceManyBody().strength(-200)).force("center", d3.forceCenter(width / 2, height / 2)); const svg = d3.select(container).append("svg").attr("viewBox", [0, 0, width, height]); const link = svg.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6).selectAll("line").data(links).join("line").attr("stroke-width", (d: any) => Math.sqrt(d.value || 1)); const node = svg.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll("circle").data(nodes).join("circle").attr("r", 5).attr("fill", palette[0]); node.append("title").text((d: any) => d.id); simulation.on("tick", () => { link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y); node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y); });
                    break;
                }
                case 'dendrogram': {
                    if (!has('id') || !has('parent')) return;
                    if (chartOptions.title.display && chartOptions.title.text) { const titleEl = document.createElement('h3'); titleEl.textContent = chartOptions.title.text; titleEl.className = 'text-lg font-bold text-center text-slate-200 mb-2'; container.appendChild(titleEl); }
                    const rootData = d3.stratify().id((d: any) => d[get('id')]).parentId((d: any) => d[get('parent')])(chartData); const width = container.clientWidth; const height = chartOptions.title.display && chartOptions.title.text ? container.clientHeight - 30 : container.clientHeight; const treeLayout = d3.cluster().size([height, width - 200]); treeLayout(rootData); const svg = d3.select(container).append("svg").attr("width", width).attr("height", height); const g = svg.append("g").attr("transform", "translate(100,0)"); g.selectAll('.link').data(rootData.links()).enter().append('path').attr('class', 'link').attr("fill", "none").attr("stroke", "#555").attr('d', d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x) as any); const node = g.selectAll('.node').data(rootData.descendants()).enter().append('g').attr('class', 'node').attr("transform", d => `translate(${d.y},${d.x})`); node.append('circle').attr('r', 4).attr("fill", palette[0]); node.append('text').attr('dy', 3).attr('x', d => d.children ? -8 : 8).style('text-anchor', d => d.children ? 'end' : 'start').text((d: any) => d.id).attr("fill", "#e2e8f0");
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
    }, [containerId, chartData, chartDefinition, columnMapping, formatOptions, chartOptions]);

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