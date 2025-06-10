import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as THREE from "three";
import { VRPosition, Chart } from "@/types/vr-dashboard"; // Adjust this import path if needed

interface VRScenePreviewProps {
  chartType: string;
  position: VRPosition;
  charts?: Chart[];
  activeChartId?: string;
}

const VRScenePreview = ({ chartType, position, charts = [], activeChartId }: VRScenePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const chartMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraPositionRef = useRef({ radius: 15, phi: Math.PI / 3, theta: Math.PI / 4 });

  // Initialize scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    setContainerSize({ width, height });
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1f2c);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    
    const gridHelper = new THREE.GridHelper(20, 20);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.y = 0;
    scene.add(axesHelper);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    if (charts.length > 0) {
      charts.forEach(chart => createChartMesh(chart));
    } else {
      // FIX IS HERE: Added the 'color' property to the object to satisfy the Chart type.
      createChartMesh({ 
        id: 'default', 
        chartType, 
        position, 
        xAxis: '', 
        yAxis: '', 
        zAxis: '', 
        department: '', 
        color: undefined 
      } as Chart);
    }
    
    const animate = () => {
      requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePositionRef.current.x,
        y: e.clientY - previousMousePositionRef.current.y,
      };
      
      cameraPositionRef.current.theta -= deltaMove.x * 0.01;
      cameraPositionRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPositionRef.current.phi + deltaMove.y * 0.01));
      
      updateCameraPosition();
      
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      e.preventDefault();
    };
    
    const handleWheel = (e: WheelEvent) => {
      cameraPositionRef.current.radius = Math.max(2, Math.min(25, cameraPositionRef.current.radius + e.deltaY * 0.01));
      updateCameraPosition();
      e.preventDefault();
      e.stopPropagation();
    };
    
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mouseup', handleMouseUp);
    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('mouseup', handleMouseUp);
        canvasRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (width !== containerSize.width || height !== containerSize.height) {
        setContainerSize({ width, height });
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
      resizeObserver.disconnect();
    };
  }, [containerSize]);
  
  useEffect(() => {
    updateAllCharts();
  }, [charts, activeChartId]);
   
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, phi, theta } = cameraPositionRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };
  
  const createChartMesh = (chart: Chart) => {
    if (!sceneRef.current) return;
    
    const width = chart.position.width ?? 1;
    const height = chart.position.height ?? 1;
    const depth = chart.position.depth ?? 1;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({
      color: chart.color || getChartColor(chart.chartType),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);
    chartMeshesRef.current.set(chart.id, mesh);
    
    updateChartMeshPosition(mesh, chart.position);
  };
  
  const updateAllCharts = () => {
    if (!sceneRef.current) return;
    
    chartMeshesRef.current.forEach((mesh, id) => {
      if (!charts.some(chart => chart.id === id)) {
        sceneRef.current?.remove(mesh);
        chartMeshesRef.current.delete(id);
      }
    });
    
    charts.forEach(chart => {
      if (chartMeshesRef.current.has(chart.id)) {
        updateChartMesh(chart.id, chart.chartType, chart.position);
      } else {
        createChartMesh(chart);
      }
    });
  };
  
  const updateChartMesh = (id: string, chartType: string, position: VRPosition) => {
    const mesh = chartMeshesRef.current.get(id);
    if (!mesh || !sceneRef.current) return;
    
    updateChartMeshPosition(mesh, position);
    
    const width = position.width ?? 1;
    const height = position.height ?? 1;
    const depth = position.depth ?? 1;
    
    if (mesh.geometry instanceof THREE.BoxGeometry) {
      if (mesh.geometry.parameters.width !== width || 
          mesh.geometry.parameters.height !== height || 
          mesh.geometry.parameters.depth !== depth) {
        const newGeometry = new THREE.BoxGeometry(width, height, depth);
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
      }
    }
    
    if (mesh.material instanceof THREE.MeshPhongMaterial) {
      const chart = charts.find(c => c.id === id);
      mesh.material.color.set(chart?.color || getChartColor(chartType));
    }
    
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
  
  const updateChartMeshPosition = (mesh: THREE.Mesh, position: VRPosition) => {
    const x = position.x ?? 0;
    const y = position.y ?? 0;
    const z = position.z ?? 0;
    const scale = position.scale ?? 1;
    const height = position.height ?? 1;
    const rotX = position.rotation.x ?? 0;
    const rotY = position.rotation.y ?? 0;
    const rotZ = position.rotation.z ?? 0;

    const finalHeight = height * scale;
    mesh.position.set(x, y + finalHeight / 2, z);

    mesh.scale.set(scale, scale, scale);
    mesh.rotation.set(
      (rotX * Math.PI) / 180,
      (rotY * Math.PI) / 180,
      (rotZ * Math.PI) / 180
    );
  };
  
  const getChartColor = (chartType: string) => {
    switch (chartType) {
      case "bar": return 0x1E90FF;
      case "pie": return 0xFF6384;
      case "line": return 0x4BC0C0;
      case "scatter": return 0x9370DB;
      default: return 0x1E90FF;
    }
  };
  
  // Use active chart's position for display, or fallback
  const activeChart = charts.find(c => c.id === activeChartId);
  const displayPosition = activeChart?.position || position;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pré-visualização da Cena VR</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative w-full h-64">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-md border border-slate-700"
          />
          <div className="absolute bottom-2 left-2 text-xs text-slate-400 bg-slate-900/70 p-1 rounded">
            Posição: (
              {displayPosition.x?.toFixed(1) ?? 'N/A'},{' '}
              {displayPosition.y?.toFixed(1) ?? 'N/A'},{' '}
              {displayPosition.z?.toFixed(1) ?? 'N/A'}
            )
          </div>
          <div className="absolute top-2 right-2 text-xs text-slate-400 bg-slate-900/70 p-1 rounded">
            Gráficos: {charts.length}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Controlos do rato: Clique e arraste para rodar. Use a roda do rato para ampliar/reduzir.</p>
          <p className="mt-1">
            Gráfico Ativo: {activeChart?.chartType || chartType} (Escala: {displayPosition.scale?.toFixed(1) ?? 'N/A'})
          </p>
          <p>
            Dimensões: 
            L:{displayPosition.width?.toFixed(1) ?? "N/A"}{' '}
            A:{displayPosition.height?.toFixed(1) ?? "N/A"}{' '}
            P:{displayPosition.depth?.toFixed(1) ?? "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VRScenePreview;