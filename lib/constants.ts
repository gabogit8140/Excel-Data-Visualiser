import { ChartDefinition } from './types';

export const CHART_DEFINITIONS: ChartDefinition[] = [
    // Standard Charts
    { 
        id: 'bar', name: 'Bar Chart', library: 'Chart.js', category: 'Standard', 
        description: 'Compares values across categories.',
        dimensions: [
            { id: 'category', name: 'Category Axis', type: 'text', required: true },
            { id: 'values', name: 'Value Axis (one or more)', type: 'numeric', required: true, multiple: true },
        ]
    },
    { 
        id: 'line', name: 'Line Chart', library: 'Chart.js', category: 'Standard', 
        description: 'Shows trends over time or ordered categories.',
        dimensions: [
            { id: 'category', name: 'X-Axis (Category/Time)', type: 'any', required: true },
            { id: 'values', name: 'Y-Axis (one or more)', type: 'numeric', required: true, multiple: true },
        ]
    },
    { 
        id: 'pie', name: 'Pie Chart', library: 'Chart.js', category: 'Standard', 
        description: 'Displays proportions of a whole.',
        dimensions: [
            { id: 'labels', name: 'Slice Labels', type: 'text', required: true },
            { id: 'values', name: 'Slice Values', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'scatter', name: 'Scatter Plot', library: 'Chart.js', category: 'Standard', 
        description: 'Shows relationships between two two variables.',
        dimensions: [
            { id: 'x', name: 'X-Axis', type: 'numeric', required: true },
            { id: 'y', name: 'Y-Axis', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'radar', name: 'Radar Chart', library: 'Chart.js', category: 'Standard', 
        description: 'Compares multiple variables for different items.',
        dimensions: [
            { id: 'category', name: 'Item Category (e.g., Product)', type: 'text', required: true },
            { id: 'values', name: 'Axes (one or more)', type: 'numeric', required: true, multiple: true },
        ]
    },
    // Advanced Charts
    { 
        id: 'heatmap', name: 'Heatmap', library: 'Plotly.js', category: 'Advanced', 
        description: 'Visualizes magnitude of a phenomenon as color.',
        dimensions: [
            { id: 'x', name: 'X-Axis', type: 'text', required: true },
            { id: 'y', name: 'Y-Axis', type: 'text', required: true },
            { id: 'z', name: 'Color Value', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'surface3d', name: '3D Surface Plot', library: 'Plotly.js', category: 'Advanced', 
        description: 'Represents a three-dimensional dataset.',
        dimensions: [
            { id: 'x', name: 'X Coordinate', type: 'numeric', required: true },
            { id: 'y', name: 'Y Coordinate', type: 'numeric', required: true },
            { id: 'z', name: 'Z Coordinate (Height)', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'sunburst', name: 'Sunburst Chart', library: 'Plotly.js', category: 'Advanced', 
        description: 'Visualizes hierarchical data spanning outwards.',
        dimensions: [
            { id: 'labels', name: 'Labels (Child)', type: 'text', required: true },
            { id: 'parents', name: 'Parents', type: 'text', required: true },
            { id: 'values', name: 'Values', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'treemap', name: 'Treemap', library: 'Plotly.js', category: 'Advanced', 
        description: 'Displays hierarchical data using nested rectangles.',
        dimensions: [
            { id: 'labels', name: 'Labels (Child)', type: 'text', required: true },
            { id: 'parents', name: 'Parents', type: 'text', required: true },
            { id: 'values', name: 'Values (Size)', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'funnel', name: 'Funnel Chart', library: 'Plotly.js', category: 'Advanced', 
        description: 'Represents stages in a process, like a sales pipeline.',
        dimensions: [
            { id: 'stage', name: 'Stage Name', type: 'text', required: true },
            { id: 'value', name: 'Stage Value', type: 'numeric', required: true },
        ]
    },
    {
        id: 'marimekko', name: 'Marimekko (Mekko) Chart', library: 'Plotly.js', category: 'Advanced',
        description: 'A stacked bar chart where bar width is proportional to its total value. Shows multi-dimensional data.',
        dimensions: [
            { id: 'barCategory', name: 'Bar Category', type: 'text', required: true },
            { id: 'segmentCategory', name: 'Segment Category (Color)', type: 'text', required: true },
            { id: 'value', name: 'Value', type: 'numeric', required: true },
        ]
    },
    { 
        id: 'force-directed', name: 'Force-Directed Graph', library: 'D3.js', category: 'Advanced', 
        description: 'Shows network relationships.',
        dimensions: [
            { id: 'source', name: 'Source Node', type: 'text', required: true },
            { id: 'target', name: 'Target Node', type: 'text', required: true },
            { id: 'value', name: 'Link Strength (Optional)', type: 'numeric', required: false },
        ]
    },
    { 
        id: 'dendrogram', name: 'Dendrogram', library: 'D3.js', category: 'Advanced', 
        description: 'A tree diagram for hierarchical clustering.',
        dimensions: [
            { id: 'id', name: 'Node ID (Child)', type: 'text', required: true },
            { id: 'parent', name: 'Parent ID', type: 'text', required: true },
        ]
    },
    // Animated Charts
    { 
        id: 'animated-bubble', name: 'Animated Bubble Chart', library: 'Plotly.js', category: 'Animated', 
        description: 'Shows data changes over time with animated bubbles.',
        dimensions: [
            { id: 'x', name: 'X-Axis', type: 'numeric', required: true },
            { id: 'y', name: 'Y-Axis', type: 'numeric', required: true },
            { id: 'size', name: 'Bubble Size', type: 'numeric', required: true },
            { id: 'frame', name: 'Animation Frame (e.g., Year)', type: 'any', required: true },
        ]
    },
    {
        id: 'bar-chart-race', name: 'Bar Chart Race', library: 'Plotly.js', category: 'Animated',
        description: 'Shows how ranked values change over time.',
        dimensions: [
            { id: 'label', name: 'Bar Label', type: 'text', required: true },
            { id: 'value', name: 'Bar Value', type: 'numeric', required: true },
            { id: 'frame', name: 'Animation Frame (Time)', type: 'any', required: true },
        ]
    },
];

export const COLOR_PALETTES = [
    { name: 'Default', colors: ['#38bdf8', '#fb923c', '#a78bfa', '#4ade80', '#f472b6', '#2dd4bf', '#facc15', '#e879f9'] },
    { name: 'Cool Blues', colors: ['#8ecae6', '#219ebc', '#126782', '#023047', '#ffb703', '#fd9e02'] },
    { name: 'Sunset', colors: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'] },
    { name: 'Forest', colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'] },
    { name: 'Pastel', colors: ['#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4', '#d8e2dc', '#ece4db', '#ffe5d9', '#ffd7ba', '#fec89a'] },
    { name: 'Monochromatic', colors: ['#0d47a1', '#1565c0', '#1976d2', '#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9'] },
    { name: 'Tab20', colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'] },
];