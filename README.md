
# VR Data Visualization Platform

## Project Overview

This application is a VR data visualization platform that allows users to create, configure and explore data visualizations in virtual reality. Users can select chart types, assign data indicators to axes, position and dimension multiple charts in a 3D environment, and launch immersive VR experiences.

## Features

- **Home Page**: Entry point to join existing visualizations by code or create new ones
- **Visualization Configurator**: Design dashboard to customize charts, positions, and settings
- **Multiple Chart Types**: Support for bar charts, line charts, pie charts, and scatter plots
- **Department Data Selection**: Filter data by department for focused analysis
- **Multi-Chart Support**: Create and manage multiple charts in a single VR scene with distinct colors
- **3D Preview**: Interactive 3D scene with mouse controls for camera movement
- **Position & Rotation Controls**: Place and orient charts in 3D space
- **Dimension Controls**: Customize the width, height and depth of each chart
- **Configuration Management**: Save, load, import and export visualization settings
- **Join Room**: Enter room codes to join existing collaborative sessions
- **My Visualizations**: Access to your saved visualizations (via modsivr.pt)
- **VR Experience Launch Options**: Choose between launching your configuration or joining existing ones
- **VR Experience**: Launch configured visualizations in VR (powered by A-Frame and BabiaXR)

## How to Use

1. **Home Page**:
   - Enter a visualization code to join an existing visualization
   - Click "Launch Configurator" to create a new visualization
   - Access "My Visualizations" to view your saved projects

2. **Configurator**:
   - Add multiple charts to your scene using the "Add Chart" button
   - Select a chart from the dropdown to modify its properties
   - Select a chart type (Bar, Pie, Line, Scatter)
   - Choose a department to visualize data from
   - Assign data indicators to X, Y, and Z axes
   - Use position, rotation and dimension controls to customize your chart in the VR scene
   - Preview your visualization in 2D and 3D with interactive camera controls
   - Save your configuration to enable the "Launch VR Experience" button
   - Export or import configurations as needed

3. **Launching a VR Experience**:
   - Save your configuration first
   - Click "Launch VR Experience" button
   - Choose between launching your current configuration or joining an existing visualization

4. **Data Format**:
   - The application accepts structured JSON data organized by departments
   - See `src/data/sampleVisualization.json` for an example data format

## Technical Details

This project uses:
- React with TypeScript
- Three.js for 3D previews
- Recharts for 2D chart previews
- A-Frame/BabiaXR integration for VR experience
- ShadcnUI components for modern UI

## Integration with BabiaXR

The visualization configurations created with this tool can be used with BabiaXR to create immersive data experiences. The exported JSON format contains:

- Chart type specifications
- Data mapping for each axis
- Position, rotation, scale and dimension information
- Data source references
- Multiple charts with distinct colors

## Example Data Structure

The project includes a sample visualization data structure in `src/data/sampleVisualization.json` that follows this format:

```json
{
  "id": "VR001",
  "name": "Sales Performance by Department",
  "departments": [
    {
      "name": "Electronics",
      "data": [
        {
          "quarter": "Q1",
          "sales": 523000,
          "profit": 156900,
          "units": 5230
        }
      ]
    }
  ],
  "charts": [
    {
      "id": "chart1",
      "type": "bar",
      "position": {
        "x": 0,
        "y": 1.5,
        "z": -3,
        "scale": 1.2,
        "width": 1,
        "height": 1,
        "depth": 1,
        "rotation": { "x": 0, "y": 0, "z": 0 }
      },
      "dataMapping": {
        "xAxis": "quarter",
        "yAxis": "sales",
        "zAxis": ""
      },
      "department": "Electronics",
      "color": "#1E90FF"
    }
  ]
}
```

## Development

To run this project locally:

```sh
# Install dependencies
npm install

# Run development server
npm run dev
```

## Future Enhancements

- User authentication and saved visualizations
- Real-time collaborative editing of VR scenes
- Additional chart types and visualization options
- Direct integration with data sources and APIs
- Full VR mode with A-Frame and BabiaXR
- Advanced chart styling options
- Data filtering and aggregation tools
