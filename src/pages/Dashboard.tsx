import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Se após 10 segundos ainda estiver carregando, consideramos um erro
      if (isLoading) {
        setHasError(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const retryLoading = () => {
    setIsLoading(true);
    setHasError(false);
    // Forçar recarregamento do iframe
    const iframe = document.getElementById('dashboard-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-background border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold vr-gradient-text">MODSiVR Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content with iframe */}
      <main className="flex-1 relative">
        <div className="iframe-container w-full h-[calc(100vh-80px)] overflow-hidden"
          style={{ boxSizing: "border-box" }}
          >
          {isLoading && (
            <div 
              className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-foreground">A carregar a Dashboard...</p>
            </div>
          )}
          
          {hasError && (
            <div 
              className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center text-center"
            >
              <div className="p-6 max-w-md">
                <h2 className="text-xl font-bold mb-2">Erro ao carregar a Dashboard</h2>
                <p className="mb-4">Não foi possível carregar a Dashboard. Verifique a sua ligação ou tente novamente.</p>
                <Button 
                  onClick={retryLoading} 
                  className="vr-button"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}
          
          <div 
            className="w-full h-full relative overflow-hidden"
            style={{
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none"
            }}
          >
            <iframe
              id="dashboard-iframe"
              src="https://app.appsmith.com/app/modsi-webapp/main-page-6807db039a00354830a6b72c?embed=true"
              className={`absolute top-0 left-0 w-full border-0 ${isLoading || hasError ? 'invisible' : 'visible'}`}
              style={{
                height: `calc(100% + 80px)`, // iframe taller by 80px
                display: "block",  // remove inline gap
                pointerEvents: "auto",
                userSelect: "none",
                boxSizing: "border-box",
                transform: "translateY(-80px)", // shift content up by 80px, hiding bottom 80px
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allowFullScreen
              title="MODSiVR Dashboard"
            ></iframe>
            
            {/* Overlay to prevent selection/interaction with iframe content */}
            <div 
              className="absolute inset-0 z-0" 
              style={{
                pointerEvents: "none"
              }}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;