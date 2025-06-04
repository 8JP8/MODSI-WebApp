
# VR Data Visualization Platform

## Project Overview

This application is a VR data visualization platform that allows users to create, configure and explore data visualizations in virtual reality. Users can select chart types, assign data indicators to axes, position and dimension multiple charts in a 3D environment, and launch immersive VR experiences.

## Features

- **Home Page**: Entry point to join existing visualizations by their code or create new ones or access the dashboard to manage the data
- **Visualization Configurator**: Design dashboard to customize charts, positions, and settings
- **Multiple Chart Types**: Support for bar charts (babia-bars on VR), line charts (babia-bubbles on VR), pie charts (babia-pie on VR), and scatter plots
- **KPI Selector**: Aquire company indicators data and their old value history
- **Multi-Chart Support**: Create and manage multiple charts in a single VR scene
- **3D Preview**: Interactive 3D scene to position the charts in the VR scene
- **Configuration Management**: Save, load, import and export visualization settings
- **Join Room**: Enter room codes to join existing VR rooms
- **My Visualizations**: Access to your saved visualizations
- **VR Experience Launch Options**: Choose between launching your configuration or joining existing ones
- **VR Experience**: Launch configured visualizations in VR (powered by A-Frame and BabiaXR)

## How to Use

1. **Home Page**:
   - Enter a visualization code to join an existing visualization
   - Click "Abrir Configurador" to open the configurator page to create a new visualization
   - Access "As Minhas Visualizações" to join a previously configured VR room

2. **Configurator**:
   - Add multiple charts to your scene using the "Add Chart" button
   - Select a chart from the list to modify its properties
   - Select a chart type (Bar, Pie, Line, Scatter)
   - Choose the KPIs you want to use and one of the time units or display the values by change
   - Assign data indicators to X, Y, and Z axes
   - Use position, rotation and dimension controls to customize your chart in the VR scene
   - Preview your visualization in 2D and 3D with interactive camera controls
   - Export or import configurations as needed
   - Save your configuration and press "Launch VR Experience" button to create the room

3. **Launching a VR Experience**:
   - Save your configuration first
   - Click "Launch VR Experience" button
   - Choose between launching your current configuration or joining an existing visualization

4. **Data Format**:
   - The application accepts structured JSON data organized by departments (see the [API Repository](https://github.com/8JP8/MODSI-SQLRestAPI))

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
- Position, rotation, scale and dimension information (only position is used)
- Data source references
- Multiple charts with distinct colors

## Example Data Structure

```json
[
  {
    "name": "Configuração VR",
    "config": {
      "kpihistory": [
        {
          "Id": 16,
          "KPIId": 3,
          "ChangedByUserId": 32,
          "OldValue_1": "111",
          "NewValue_1": "333",
          "OldValue_2": "222",
          "NewValue_2": "444",
          "ChangedAt": "2025-05-23T22:02:09.21"
        },
        {
          "Id": 15,
          "KPIId": 3,
          "ChangedByUserId": 32,
          "OldValue_1": "555",
          "NewValue_1": "111",
          "OldValue_2": "999",
          "NewValue_2": "222",
          "ChangedAt": "2025-05-23T22:01:47.607"
        }
      ],
      "charts": [
        {
          "id": "chart-1749056730258",
          "chartType": "barras",
          "graphname": "KPIName",
          "position": {
            "x": 0,
            "y": 1,
            "z": -2,
            "scale": 1,
            "width": 1,
            "height": 1,
            "depth": 1,
            "rotation": {
              "x": 0,
              "y": 0,
              "z": 0
            }
          },
          "xAxis": "years",
          "yAxis": "3",
          "zAxis": "0",
          "department": "",
          "color": "#1E90FF"
        }
      ],
      "activeChartId": "chart-1749056730258"
    }
  }
]
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

- Real-time collaborative editing of VR scenes
- Additional chart types and visualization options
- Advanced chart styling options
