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
        description: 'Shows relationships between two variables.',
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
        id: 'marimekko', name: 'Marimekko Chart', library: 'Plotly.js', category: 'Advanced',
        description: 'A stacked bar chart where bar width is proportional to its total value.',
        dimensions: [
            { id: 'x', name: 'Bar Category (X-Axis)', type: 'text', required: true },
            { id: 'y', name: 'Segment Value (Y-Axis)', type: 'numeric', required: true },
            { id: 'segment', name: 'Segment Category (Color)', type: 'text', required: true },
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