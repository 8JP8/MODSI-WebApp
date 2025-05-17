
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const Dashboard = () => {
  useEffect(() => {
    const iframe = document.getElementById('dashboard-iframe') as HTMLIFrameElement;
    const overlay = document.getElementById('loading-overlay');

    if (iframe && overlay) {
      iframe.onload = function () {
        if (overlay) {
          overlay.style.display = 'none';
          iframe.style.display = 'block';
        }
      };

      iframe.onerror = function () {
        if (overlay) {
          overlay.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: white;">
                <h2>Erro ao carregar a Dashboard</h2>
                <p>Não foi possível carregar a Dashboard. Verifique sua conexão ou tente novamente.</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(66, 135, 245, 0.7); color: white; border: none; border-radius: 5px; cursor: pointer;">Tentar Novamente</button>
            </div>
          `;
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold vr-gradient-text">Dashboard MODSiVR</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex-grow relative w-full">
        <div className="iframe-container h-full">
          <div id="loading-overlay" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'black', zIndex: 99, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div className="loading-spinner"></div>
          </div>
          <iframe 
            id="dashboard-iframe" 
            src="https://app.appsmith.com/app/modsi-webapp/main-page-6807db039a00354830a6b72c?embed=true" 
            title="Dashboard MODSiVR"
            className="w-full h-full" 
            style={{display: 'none', height: 'calc(100vh - 73px)', border: 'none'}}
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
