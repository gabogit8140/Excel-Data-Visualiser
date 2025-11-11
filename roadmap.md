# Excel Data Visualizer Roadmap

This document outlines the development roadmap for the Excel Data Visualizer application. It tracks implemented features, planned enhancements, and future ideas.

## v1.0.0 - Initial Release (Current)

### Core Features
- **File Upload:** Support for uploading `.xlsx` files.
- **Data Source Selection:** Ability to select data from Sheets or Tables within the uploaded Excel file.
- **Data Preview:** Interactive data table preview with column type overrides (Auto, Text, Number, Date).
- **Chart Creation Workflow:** A step-by-step process to create visualizations:
    1.  Upload File
    2.  Select Data Source
    3.  Select Chart Type
    4.  Map Columns to chart dimensions
    5.  Visualize & Customize
- **Diverse Chart Library:**
    - **Standard Charts (Chart.js):** Bar, Line, Pie, Scatter, Radar.
    - **Advanced Charts (Plotly.js):** Heatmap, 3D Surface, Sunburst, Treemap, Funnel, Marimekko, Violin Plot.
    - **Advanced Charts (D3.js):** Force-Directed Graph, Dendrogram.
    - **Animated Charts (Plotly.js):** Animated Bubble Chart, Bar Chart Race.
- **Interactive Visualization View:**
    - **Filtering:** Apply dynamic filters to the data (numeric range, categorical selection, date range).
    - **Formatting:** Customize number and date formats for display.
    - **Customization:** Adjust chart title, axes, legend, and color palettes.
- **Visualization Catalogue:**
    - Save created visualizations to a personal catalogue.
    - View, edit, and delete saved visualizations.
    - Interactive modal for exploring saved charts with live filter/format/customize controls.
- **Project Management:**
    - **Save/Load Project:** Save the entire catalogue (all visualizations and their configurations) to a `.xlviz` file.
    - **Load Project:** Load a `.xlviz` file to restore a previous session.
    - Start a new project, clearing all data.
- **Exporting:**
    - Save individual charts as PNG images.
    - Save Plotly.js charts as interactive HTML files.

## Future Versions (Ideas & Planned Features)

### v1.1.0 - AI & Usability Enhancements

-   **[ ] AI-Powered Chart Suggestions:** Integrate with Gemini API to automatically suggest appropriate chart types based on the selected data.
-   **[ ] AI-Powered Data Insights:** Use AI to generate a natural language summary of the key insights from a visualization.
-   **[ ] Improved UI/UX:**
    -   Refine the column mapping interface for better usability.
    -   Add more color palettes and customization options.
    -   Enhance accessibility (ARIA attributes, keyboard navigation).
-   **[ ] More Chart Types:**
    -   Box Plot
    -   Waterfall Chart
-   **[ ] Data Transformation:**
    -   Basic data cleaning options (e.g., handle missing values).
    -   Calculated fields.

### v1.2.0 - Advanced Analytics & Integrations

-   **[ ] Statistical Overlays:** Add trend lines, moving averages, and other statistical information to charts.
-   **[ ] Dashboarding:** Allow users to combine multiple saved visualizations into a single dashboard view.
-   **[ ] Sharing:**
    -   Generate shareable links to interactive visualizations.
    -   Embeddable chart snippets.
-   **[ ] Direct Data Connections:** Explore connecting to Google Sheets or other online data sources directly.
