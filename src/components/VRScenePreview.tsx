
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as THREE from "three";

interface VRPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

interface Chart {
  id: string;
  chartType: string;
  position: VRPosition;
  xAxis: string;
  yAxis: string;
  zAxis: string;
  department: string;
}

interface VRScenePreviewProps {
  chartType: string;
  position: VRPosition;
  charts?: Chart[];
  activeChartId?: string;
}

const VRScenePreview = ({ chartType, position, charts = [], activeChartId }: VRScenePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const chartMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  
  // Mouse controls state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraPositionRef = useRef({ radius: 5, phi: Math.PI / 2, theta: Math.PI / 2 });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1f2c);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    updateCameraPosition();
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.position.y = -1;
    scene.add(gridHelper);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.y = -1;
    scene.add(axesHelper);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Setup chart mesh
    if (charts.length > 0) {
      charts.forEach(chart => createChartMesh(chart));
    } else {
      // Legacy support for single chart
      createChartMesh({ id: 'default', chartType, position, xAxis: '', yAxis: '', zAxis: '', department: '' });
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    
    // Event listeners for mouse controls
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePositionRef.current.x,
        y: e.clientY - previousMousePositionRef.current.y,
      };
      
      // Update camera orbit position
      cameraPositionRef.current.theta -= deltaMove.x * 0.01;
      cameraPositionRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, cameraPositionRef.current.phi + deltaMove.y * 0.01)
      );
      
      updateCameraPosition();
      
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    const handleWheel = (e: WheelEvent) => {
      // Zoom in/out
      cameraPositionRef.current.radius = Math.max(
        2,
        Math.min(10, cameraPositionRef.current.radius + e.deltaY * 0.01)
      );
      updateCameraPosition();
    };
    
    // Add event listeners
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasRef.current.addEventListener('wheel', handleWheel);
    
    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);
  
  // Update charts when they change
  useEffect(() => {
    updateAllCharts();
  }, [charts]);
  
  // Update single chart when position or type changes
  useEffect(() => {
    if (activeChartId) {
      updateChartMesh(activeChartId, chartType, position);
    }
  }, [position, chartType, activeChartId]);
  
  // Helper function to update camera position
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    
    const { radius, phi, theta } = cameraPositionRef.current;
    
    // Convert spherical coordinates to Cartesian
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    cameraRef.current.lookAt(0, 0, 0);
  };
  
  // Create chart mesh for a new chart
  const createChartMesh = (chart: Chart) => {
    if (!sceneRef.current) return;
    
    let geometry: THREE.BufferGeometry;
    const material = new THREE.MeshPhongMaterial({
      color: getChartColor(chart.chartType),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    
    switch (chart.chartType) {
      case "bar":
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case "pie":
        geometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
        break;
      case "line":
        geometry = new THREE.PlaneGeometry(1.5, 1);
        break;
      case "scatter":
        // Create a group of spheres for scatter plot
        geometry = new THREE.SphereGeometry(0.5, 16, 16);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);
    chartMeshesRef.current.set(chart.id, mesh);
    
    // Position the mesh
    updateChartMeshPosition(mesh, chart.position);
  };
  
  // Update positions of all chart meshes
  const updateAllCharts = () => {
    if (!sceneRef.current) return;
    
    // Clear existing meshes that are not in current charts
    chartMeshesRef.current.forEach((mesh, id) => {
      if (!charts.some(chart => chart.id === id)) {
        sceneRef.current?.remove(mesh);
        chartMeshesRef.current.delete(id);
      }
    });
    
    // Update or create meshes for all charts
    charts.forEach(chart => {
      if (chartMeshesRef.current.has(chart.id)) {
        updateChartMesh(chart.id, chart.chartType, chart.position);
      } else {
        createChartMesh(chart);
      }
    });
  };
  
  // Update a specific chart mesh
  const updateChartMesh = (id: string, chartType: string, position: VRPosition) => {
    const mesh = chartMeshesRef.current.get(id);
    if (!mesh || !sceneRef.current) return;
    
    // Update position and rotation
    updateChartMeshPosition(mesh, position);
    
    // Update material color based on chart type
    if (mesh.material instanceof THREE.MeshPhongMaterial) {
      mesh.material.color.set(getChartColor(chartType));
    }
    
    // Highlight active chart
    if (id === activeChartId) {
      if (mesh.material instanceof THREE.MeshPhongMaterial) {
        mesh.material.opacity = 1.0;
        mesh.material.emissive.set(0x333333);
      }
    } else {
      if (mesh.material instanceof THREE.MeshPhongMaterial) {
        mesh.material.opacity = 0.7;
        mesh.material.emissive.set(0x000000);
      }
    }
  };
  
  // Update chart mesh position
  const updateChartMeshPosition = (mesh: THREE.Mesh, position: VRPosition) => {
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(position.scale, position.scale, position.scale);
    mesh.rotation.set(
      (position.rotation.x * Math.PI) / 180,
      (position.rotation.y * Math.PI) / 180,
      (position.rotation.z * Math.PI) / 180
    );
  };
  
  // Get chart color based on chart type
  const getChartColor = (chartType: string) => {
    switch (chartType) {
      case "bar":
        return 0x1E90FF;
      case "pie":
        return 0xFF6384;
      case "line":
        return 0x4BC0C0;
      case "scatter":
        return 0x9370DB;
      default:
        return 0x1E90FF;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>VR Scene Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-md border border-slate-700"
          />
          <div className="absolute bottom-2 left-2 text-xs text-slate-400 bg-slate-900/70 p-1 rounded">
            Position: ({position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)})
          </div>
          <div className="absolute top-2 right-2 text-xs text-slate-400 bg-slate-900/70 p-1 rounded">
            Charts: {charts.length}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Mouse controls: Click and drag to rotate view. Use scroll wheel to zoom in/out.</p>
          <p className="mt-1">Active Chart: {chartType} (Scale: {position.scale.toFixed(1)})</p>
          <p>Rotation: ({position.rotation.x}°, {position.rotation.y}°, {position.rotation.z}°)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VRScenePreview;
