
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/use-theme';
import { Github } from 'lucide-react';
import { HelpButton } from '@/components/HelpButton';

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create dynamic 3D bar graph
    const bars: THREE.Mesh[] = [];
    const barCount = 30;
    const barMaxHeight = 5;
    const spacing = 1.2;
    const areaSize = Math.sqrt(barCount) * spacing;

    // Create bars with random heights
    for (let i = 0; i < barCount; i++) {
      const x = (i % Math.sqrt(barCount)) * spacing - (areaSize / 2);
      const z = Math.floor(i / Math.sqrt(barCount)) * spacing - (areaSize / 2);
      const height = Math.random() * barMaxHeight + 0.5;

      const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0.2 + Math.random() * 0.2, 0.4 + Math.random() * 0.3, 0.7 + Math.random() * 0.3),
        transparent: true,
        opacity: 0.8,
        shininess: 80
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(x, height / 2, z);
      bar.userData = {
        targetHeight: height,
        speed: 0.02 + Math.random() * 0.02
      };
      scene.add(bar);
      bars.push(bar);
    }

    // Add a circular plane as a base
    const circleGeometry = new THREE.CircleGeometry(areaSize * 0.8, 64);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x111111 : 0xf5f5f5,
      side: THREE.DoubleSide
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    scene.add(circle);

    // Add ambient and directional light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Animation loop
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate the scene slightly
      scene.rotation.y += 0.002;

      // Animate bar heights smoothly
      bars.forEach(bar => {
        if (Math.random() < 0.01) {
          bar.userData.targetHeight = Math.random() * barMaxHeight + 0.5;
        }

        const currentHeight = bar.scale.y;
        const targetHeight = bar.userData.targetHeight;
        const diff = targetHeight - currentHeight;

        if (Math.abs(diff) > 0.01) {
          bar.scale.y += diff * bar.userData.speed;
          bar.position.y = (bar.scale.y * bar.geometry.parameters.height) / 2;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose of resources
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      rendererRef.current?.dispose();
    };
  }, [theme]);

  // Update the base plane color when theme changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    sceneRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry instanceof THREE.CircleGeometry) {
        if (object.material instanceof THREE.MeshBasicMaterial) {
          object.material.color.set(theme === 'dark' ? 0x111111 : 0xf5f5f5);
          object.material.needsUpdate = true;
        }
      }
    });
  }, [theme]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-10" />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full py-4 px-6 flex justify-between items-center bg-background/70 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold vr-gradient-text">MODSiVR</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <HelpButton />
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-4xl w-full backdrop-blur-md bg-background/40 p-8 rounded-xl shadow-lg border border-border">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 vr-gradient-text">MODSiVR</h1>
            <p className="text-xl mb-10 text-foreground/80">
              Plataforma de Modelação e Simulação Interativa em VR para Treino em Redes de Comunicação
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/visualization-hub">
                <Button size="lg" className="vr-button min-w-[200px]">
                  Visualizações VR
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 px-6 bg-background/70 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-center px-4">
            <div className="repos-container mb-4 md:mb-0">
              <h4 className="text-sm font-semibold mb-2">Repositórios:</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="https://github.com/8JP8/MODSI-VRVisualization" 
                   className="text-sm flex items-center gap-1 hover:text-primary transition-colors" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span>MODSI-VRVisualization</span>
                </a>
                <a href="https://github.com/8JP8/MODSI-WebApp" 
                   className="text-sm flex items-center gap-1 hover:text-primary transition-colors" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span>MODSI-WebApp</span>
                </a>
                <a href="https://github.com/8JP8/MODSI-SQLRestAPI" 
                   className="text-sm flex items-center gap-1 hover:text-primary transition-colors" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span>MODSI-SQLRestAPI</span>
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a href="https://isep.ipp.pt" target="_blank" rel="noopener noreferrer" className="inline-block ml-3">
                <img 
                  src="https://www.isep.ipp.pt/images/ISEP_marca_cor.png" 
                  alt="ISEP Logo" 
                  className="h-10"
                />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
