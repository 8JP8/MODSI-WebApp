import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, Settings, Home, ExternalLink } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const VRRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomVerified, setRoomVerified] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!roomCode) {
      console.error("No room code provided");
      setError("Código da sala não encontrado");
      setLoading(false);
      return;
    }

    console.log("Verifying VR room with code:", roomCode);

    // Verify the room exists by calling the API
    fetch(`https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api/Room/Get/${roomCode}?code=z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Room not found: ${response.status}`);
        }
        return response.json();
      })
      .then(roomData => {
        console.log("Room data verified successfully:", roomData);
        setRoomVerified(true);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error verifying room:", error);
        setError("Sala não encontrada ou erro ao carregar dados");
        setLoading(false);
      });
  }, [roomCode]);

  const handleIframeLoad = () => {
    console.log("VR iframe loaded successfully");
  };

  const handleIframeError = () => {
    console.error("Error loading VR iframe");
    setError("Erro ao carregar visualização VR");
  };

  const handleRedirectToVR = () => {
    window.open(`https://modsi-vr.pt?room=${roomCode}`, '_blank');
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Erro</h1>
          <p className="text-muted-foreground">Código da sala não encontrado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verificando Sala VR</h1>
          <p className="text-muted-foreground">A verificar sala {roomCode}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Erro</h1>
          <p className="text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Sala: {roomCode}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button 
              onClick={() => window.location.href = '/configurator'}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
            >
              <Settings className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              Voltar ao Configurador
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-6 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors"
            >
              <Home className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (roomVerified) {
    return (
      <div className="h-screen w-screen bg-background relative">
        <iframe
          src={`https://modsi-vr.pt?room=${roomCode}`}
          className="w-full h-full border-0"
          title={`VR Visualization - Room ${roomCode}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
        
        {/* Mobile redirect button */}
        <button
          onClick={handleRedirectToVR}
          className="fixed bottom-4 right-4 md:hidden flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg transition-all duration-200 z-50"
          title="Abrir VR em nova janela"
        >
          <ExternalLink className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
          <span className="text-sm font-medium">Abrir VR</span>
        </button>
      </div>
    );
  }

  return null;
};

export default VRRoom;
